set dotenv-load := true

## GENERAL

[private]
default:
    @just --list --unsorted --justfile {{ justfile() }} | .just/format-help.sh

[doc("
Execute a command from the command menu.
")]
[group("General")]
run:
    @just --choose

[doc("
Install and setup essential tools and dependencies.
")]
[group("General")]
get-started:
    fnm install && fnm use && corepack enable pnpm && pnpm i
    prek install
    pnpx @sentry/dotagents install
    just format .mcp.json

[doc("
Update all tools.
")]
[group("General")]
update-tools:
    uv tool update rust-just && uv tool upgrade prek

[doc("
List all workspace members.
")]
[group("General")]
list-members:
    pnpm list --recursive --depth -1 --filter "./apps/*" --filter "./packages/*" --parseable | awk -F'/' '{print $NF}'

[doc("
Manually trigger dependency graph visualization update for every workspace member.
")]
[group("General")]
update-graphviz:
    pnpm workspace-members generate:graphviz

[doc("
Generate Mermaid diagrams of open issues grouped by priority.
")]
[group("General")]
issues-diagram:
    uv run https://raw.githubusercontent.com/bitcart/bitcart-actions/refs/heads/master/scripts/issues-diagram.py

[doc("
Clean up all workspace artifacts, such as cache, node modules, and transient code generation outputs.
")]
[group("General")]
drop-artifacts:
    find . -type d,f \( -name .nx -o -name dist -o -name node_modules -o -name uno.generated.css \) -prune -exec rm -rf {} +

[doc("
Clean up all workspace artifacts, reinstall dependencies, and rebuild all workspace members.
")]
[env("BITCART_ENV", "development")]
[group("General")]
clean-rebuild: drop-artifacts
    pnpm i
    @just build

[doc("
Build all workspace members.
")]
[group("General")]
build *nx-args:
    @pnpm nx run-many --target=build $(just _nx-args {{ nx-args }})

[doc("
Build only library packages (excludes apps).
")]
[group("General")]
build-packages *nx-args:
    @pnpm nx run-many --target=build --projects='packages/*' $(just _nx-args {{ nx-args }})

## DEPENDENCY MANAGEMENT

[doc("
Add external dependency to the workspace root.

Example: `just root-add @t3-oss/env-core`
")]
[group("Dependency management")]
root-add package-specifier:
    .just/add-nodejs-dependency.sh dependencies root -PEw '{{ package-specifier }}'

[doc("
Add external dev dependency to the workspace root.

Example: `just root-add-dev @effect/language-service`
")]
[group("Dependency management")]
root-add-dev package-specifier:
    .just/add-nodejs-dependency.sh devDependencies root -DEw '{{ package-specifier }}'

[doc("
Add external dependency to a specific workspace member package.

Example: `just add ui-kit @phosphor-icons/react`
")]
[group("Dependency management")]
add ws-member-name package-specifier:
    .just/add-nodejs-dependency.sh dependencies '{{ ws-member-name }}' -PE '{{ package-specifier }}'

[doc("
Add external dev dependency to a specific workspace member package.

Example: `just add-dev ui-kit @unocss/cli`
")]
[group("Dependency management")]
add-dev ws-member-name package-specifier:
    .just/add-nodejs-dependency.sh devDependencies '{{ ws-member-name }}' -DE '{{ package-specifier }}'

[doc("
Install component primitives from shadcn/ui compliant registries into the UI Kit.

Example: `just add-ui-kit-components @coss/command accordion`
")]
[group("Dependency management")]
add-ui-kit-components +component-names:
    pnpm ui-kit add:components {{ component-names }}

## CODE QUALITY

[doc("
Auto-format code with oxfmt.
")]
[group("Code quality")]
format *files:
    @pnpm oxfmt {{ files }}

[doc("
Run linters with autofix.
")]
[group("Code quality")]
lint *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=lint $(just _nx-args {{ nx-args }})

[doc("
Format and lint, fixing all issues.
")]
[group("Code quality")]
fix: format lint

[doc("
Verify formatting with oxfmt.
")]
[group("Code quality")]
format-check *files:
    @pnpm oxfmt --check {{ files }}

[doc("
Verify linting.
")]
[group("Code quality")]
lint-check *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=lint:check $(just _nx-args {{ nx-args }})

[doc("
Run type checking.
")]
[group("Code quality")]
typecheck *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=typecheck $(just _nx-args {{ nx-args }})

[doc("
Run dependency checks.
")]
[group("Code quality")]
depcheck *args:
    @pnpm knip --no-progress {{ args }}

[doc("
Run all checks without fixing.
")]
[group("Code quality")]
check: format-check lint-check typecheck depcheck

[doc("
Run tests.
")]
[group("Code quality")]
test *args: (e2e args)

[doc("
Run CI checks.
")]
[group("Code quality")]
ci *args: check (test args)

[doc("
Manually trigger pre-commit hooks.
")]
[group("Code quality")]
pre-commit:
    prek run --all-files

## SERVICES

[doc("
Start all development server instances in parallel
")]
[env("BITCART_ENV", "development")]
[group("Services")]
[no-exit-message]
dev *nx-args:
    pnpm i
    @pnpm nx run-many --target=dev $(just _nx-args {{ nx-args }})

[doc("
Serve production preview for every application in parallel.
")]
[group("Services")]
[no-exit-message]
preview *nx-args:
    @pnpm nx run-many --target=preview $(just _nx-args {{ nx-args }})

## INTERNATIONALIZATION AND LOCALIZATION

[doc("
Extract i18n catalogs for a specific workspace member or a group of workspace members.
If no scope is specified, all workspace applications are targeted.
Translation is not performed.
")]
[env("BITCART_ENV", "production")]
[group("Internationalization and localization")]
locales-extract +scope="apps":
    pnpm {{ scope }} i18n:extract-locales
    echo "🌐 Locales extracted without pseudo locale ✅"

[doc("
Extract i18n catalogs for a specific workspace member or a group of workspace members with pseudo locale included.
If no scope is specified, all workspace applications are targeted.
Translation is not performed.
")]
[env("BITCART_ENV", "development")]
[group("Internationalization and localization")]
locales-extract-dev +scope="apps":
    pnpm {{ scope }} i18n:extract-locales
    echo "🌐 Locales extracted with pseudo locale included ✅"

## TESTING

[doc("
Install Chromium for Playwright along with system dependencies.
")]
[group("Testing")]
e2e-setup *args:
    pnpm exec playwright install {{ args }} chromium --with-deps

[doc("
Run Playwright E2E tests for all apps.
")]
[env("BITCART_ENV", "testing")]
[group("Testing")]
e2e *nx-args:
    @pnpm nx run-many {{ _ci_parallel }} --target=e2e --projects='apps/*' $(just _nx-args {{ nx-args }})

[doc("
Run E2E tests for a specific app.
Example: `just e2e-app landing`
")]
[env("BITCART_ENV", "testing")]
[group("Testing")]
e2e-app app *args:
    pnpm {{ app }} e2e {{ args }}

[doc("
Open Playwright interactive UI for a specific app.
Example: `just e2e-ui landing`
")]
[group("Testing")]
e2e-ui app:
    pnpm {{ app }} e2e:ui

[doc("
Open the Playwright HTML test report for a specific app.
Example: `just e2e-report landing`
")]
[group("Testing")]
e2e-report app:
    pnpm {{ app }} e2e:report

## RELEASES

[doc("
Build and release a static site (Landing or Directory).

Example: `just release-static-site landing`
")]
[group("Releases")]
release-static-site app:
    pnpm {{ app }} release

## INTERNAL RECIPES

[private]
_nx-args *args:
    #!/usr/bin/env sh
    if [ -n "${NX_ARGS:-}" ]; then
        echo "$NX_ARGS"
    elif [ -n "{{ args }}" ]; then
        echo "{{ args }}"
    fi

[private]
unsafe-commit-noverify *message:
    git commit --no-verify -m "{{ message }}"

[private]
_ci_parallel := if env("CI", "") != "" { "--parallel=" + env("CI_PARALLEL", "1") } else { "" }
