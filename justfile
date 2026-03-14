set dotenv-load := true

## GENERAL RECIPES

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
List all workspace member packages.
")]
[group("General")]
list-members:
    pnpm list --recursive --depth -1 --filter "./apps/*" --filter "./packages/*" --parseable | awk -F'/' '{print $NF}'

[doc("
Manually update dependency graph visualizations for every workspace package.
")]
[group("General")]
update-graphviz:
    pnpm --filter './apps/*' --filter './packages/*' generate:graphviz

[doc("
Clean up all workspace artifacts, such as cache, node modules, and transient code generation outputs.
")]
[group("General")]
drop-artifacts:
    find . -type d,f \( -name .nx -o -name dist -o -name node_modules -o -name uno.generated.css \) -prune -exec rm -rf {} +

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
Install shadcn/ui component primitives into the UI Kit.

Example: `just ui-kit-shadcn-add accordion`
")]
[group("Dependency management")]
ui-kit-shadcn-add component-name:
    pnpm ui-kit shadcn-add '{{ component-name }}'

### CODE QUALITY

[doc("
Auto-format code with oxfmt.
")]
[group("Code quality")]
format:
    @pnpm oxfmt

[doc("
Lint with autofix using oxlint.
")]
[group("Code quality")]
lint *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=lint $(just _nx-args {{ nx-args }})

[doc("
Lint and format, fixing all issues.
")]
[group("Code quality")]
fix: lint format

[doc("
Verify formatting with oxfmt.
")]
[group("Code quality")]
format-check:
    @pnpm oxfmt --check

[doc("
Verify linting with oxlint.
")]
[group("Code quality")]
lint-check *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=lint:check $(just _nx-args {{ nx-args }})

[doc("
Run typecheck for all workspace packages.
")]
[group("Code quality")]
typecheck *nx-args:
    @pnpm nx run-many --outputStyle=stream --target=typecheck $(just _nx-args {{ nx-args }})

[doc("
Run all checks (format, lint, typecheck) without fixing.
")]
[group("Code quality")]
check: format-check lint-check typecheck

[doc("
Full CI pipeline: all checks + tests.
")]
[group("Code quality")]
ci: check

## DEVELOPMENT and CI/CD

[doc("
Start all development server instances in parallel
")]
[group("Development and CI/CD")]
[no-exit-message]
dev *nx-args:
    pnpm i
    @pnpm nx run-many --target=dev $(just _nx-args {{ nx-args }})

[doc("
Build all workspace packages.
")]
[group("Development and CI/CD")]
build *nx-args:
    @pnpm nx run-many --target=build $(just _nx-args {{ nx-args }})

[doc("
Serve production preview for every application in parallel.
")]
[group("Development and CI/CD")]
[no-exit-message]
preview *nx-args:
    @pnpm nx run-many --target=preview $(just _nx-args {{ nx-args }})

[doc("
Manually trigger pre-commit hooks.
")]
[group("Development and CI/CD")]
precommit:
    prek run --all-files

## INTERNATIONALIZATION AND LOCALIZATION

[doc("
Refresh i18n catalogs for all workspace applications.
")]
[group("Internationalization and localization")]
generate-locales: landing-generate-locales directory-generate-locales
    echo "✅ Done"

[doc("
Refresh i18n catalogs for the landing website.
")]
[group("Internationalization and localization")]
landing-generate-locales:
    pnpm landing generate:locales
    pnpm landing locales:extract

[doc("
Refresh i18n catalogs for Directory.
")]
[group("Internationalization and localization")]
directory-generate-locales:
    pnpm directory generate:locales
    pnpm directory locales:extract

## INTERNAL RECIPES

[private]
_nx-args *args:
    #!/usr/bin/env sh
    if [ -n "${NX_ARGS:-}" ]; then
        echo "$NX_ARGS"
    elif [ -n "{{ args }}" ]; then
        echo "{{ args }}"
    fi
