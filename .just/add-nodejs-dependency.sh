#!/usr/bin/env sh
# Usage: add-nodejs-dependency.sh <catalog> <ws-member|root> <pnpm-flags> <package-specifier>
set -eu

catalog="$1"
member="$2"
flags="$3"
spec="$4"

WORKSPACE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Strip version specifier to get bare package name:
#   react@19       -> react
#   @scope/pkg@1.0 -> @scope/pkg
#   react          -> react
pkg_name=$(printf '%s' "$spec" | sed 's/@[^@/][^@/]*$//')

# Locate the target package.json (workspace root or member directory)
if [ "$member" = "root" ]; then
    pkg_json="${WORKSPACE_ROOT}/package.json"
else
    pkg_json=""
    for dir in "${WORKSPACE_ROOT}/apps/${member}" "${WORKSPACE_ROOT}/packages/${member}"; do
        if [ -f "${dir}/package.json" ]; then
            pkg_json="${dir}/package.json"
            break
        fi
    done
    if [ -z "$pkg_json" ]; then
        echo "Error: Could not find package directory for '${member}'" >&2
        exit 1
    fi
fi

# Look up a package's pinned version in a named catalog.
# Handles single-quoted, double-quoted, and unquoted (pkg) YAML keys.
catalog_version() {
    awk -v section="  $1:" -v pkg="${pkg_name}" '
        $0 == section { p=1; next }
        p && /^  [a-zA-Z'"'"'"@]/ { p=0 }
        p && /^    / {
            key = $0
            sub(/^[[:space:]]*["'"'"']?/, "", key)
            sub(/["'"'"']?[[:space:]]*:.*$/, "", key)
            if (key == pkg) {
                val = $0
                sub(/^.*:[[:space:]]*/, "", val)
                print val
                exit
            }
        }
    ' "${WORKSPACE_ROOT}/pnpm-workspace.yaml"
}

pinned_version=$(catalog_version "$catalog")

if [ -n "$pinned_version" ]; then
    # Package is in the target catalog — skip if already referenced in target package.json
    if grep -qF "\"${pkg_name}\":" "${pkg_json}"; then
        echo "Note: '${pkg_name}' is already in the workspace catalog and already installed. Nothing to do."
        exit 0
    fi
    echo "Note: '${pkg_name}' is already in the workspace catalog at ${pinned_version}. Using catalog reference."
    # pnpm add with catalog:<name> specifier is unreliable for unscoped packages
    # (writes "catalog:" instead of "catalog:<name>"), so edit package.json directly.
    if printf '%s' "$flags" | grep -qF 'D'; then
        dep_field="devDependencies"
    else
        dep_field="dependencies"
    fi
    _tmp=$(mktemp)
    jq --arg name "${pkg_name}" \
       --arg val "catalog:${catalog}" \
       --arg field "${dep_field}" \
       '.[$field][$name] = $val | .[$field] |= (to_entries | sort_by(.key) | from_entries)' \
       "${pkg_json}" > "$_tmp" && mv "$_tmp" "${pkg_json}"
    pnpm install
    exit 0
else
    # Check if the package is pinned in the other catalog — cross-catalog collisions are not allowed
    if [ "$catalog" = "dependencies" ]; then
        other_catalog="devDependencies"
    else
        other_catalog="dependencies"
    fi
    other_version=$(catalog_version "$other_catalog")
    if [ -n "$other_version" ]; then
        echo "Error: '${pkg_name}' is already pinned in the '${other_catalog}' catalog at ${other_version}." >&2
        echo "Use the appropriate recipe to add it from the correct catalog." >&2
        exit 1
    fi
    # catalogMode: strict requires an explicit version for new catalog entries.
    # If the user didn't provide one, resolve the latest from the registry.
    if [ "$pkg_name" = "$spec" ]; then
        echo "Resolving latest version of '${pkg_name}' from the registry..."
        resolved_version=$(pnpm view "$pkg_name" version 2>/dev/null)
        if [ -z "$resolved_version" ]; then
            echo "Error: Could not resolve package '${pkg_name}' from the registry." >&2
            exit 1
        fi
        effective_spec="${pkg_name}@${resolved_version}"
    else
        effective_spec="$spec"
    fi
fi

if [ "$member" = "root" ]; then
    pnpm $flags --save-catalog-name "$catalog" add "$effective_spec"
else
    pnpm "$member" add --save-catalog-name "$catalog" $flags "$effective_spec"
fi
