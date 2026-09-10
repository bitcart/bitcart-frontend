---
name: forgejo-api
description: Read and update issues, pull requests, comments, labels, reviews and Actions CI runs on git.bitcart.ai via the Forgejo (Gitea-compatible) REST API, authenticating with FORGEJO_TOKEN without exposing it. Use whenever a task touches an issue, PR or CI run on git.bitcart.ai or the `bitcart-git` remote — reading one, commenting, editing, labelling, closing, opening a PR, fetching a diff, reading a failed job's log — and use it *instead of* `gh` or the GitHub API, which talk to the `origin` GitHub mirror and cannot see Forgejo issues, PRs or workflow runs at all. Also triggers on a bare issue/PR number or a git.bitcart.ai URL when the surrounding work is about the Bitcart forge.
---

# Calling the Forgejo API on git.bitcart.ai

## Quick start

Use the bundled wrapper for every call — it is `curl` with the credential handling already right:

```bash
.agents/skills/forgejo-api/scripts/fj '/repos/{repo}/issues/42'
```

`fj` sources `FORGEJO_TOKEN` from the repo-root `.env` and sends it as an `Authorization` header,
prepends `https://git.bitcart.ai/api/v1`, adds `-sS`, and sets a JSON `Content-Type` whenever you
send a body. Curl flags go before the path, which must come last. It refuses `-v` and the other
flags that would print the token. The rest of this file is why those defaults are what they are.

`{repo}` expands to whichever remote points at the forge, whatever its name, or to `$FORGEJO_REPO`.
Write an owner and name into the path instead to address any other repo, no remote required.

## You are on the wrong forge by default

Bitcart repos typically have two remotes: `origin` pointing at a GitHub mirror, and `bitcart-git`
pointing at `git.bitcart.ai`, which is the forge that actually hosts issues and pull requests. `gh` is installed
here and will happily answer questions about GitHub, so the failure mode is silent and confident:
you ask for issue #42, `gh` returns a _different_ issue #42 from the mirror, or reports it missing,
and nothing about the output says you queried the wrong host. **Never use `gh`, `gh api`, or
`api.github.com` for Bitcart issue and PR work.** No Forgejo-aware CLI is installed either, so HTTP
is the only route — check `command -v tea` before assuming otherwise.

An issue's **index** is the number shown in the UI, the `{index}` in a path, and the `number` field
in JSON. A run has its own index, confusingly named `index_in_repo` — see [API.md](API.md).

## Never expose the token

`FORGEJO_TOKEN` lives in the repo-root `.env`. **Do not read, cat, grep or otherwise open `.env`** —
that pastes a live credential into the transcript permanently. `fj` sources it for you; these rules
are what it enforces, and what you must uphold yourself if you ever call `curl` directly:

- **Never `echo`, print, or interpolate the token**, and never run `env`, `set`, or `printenv`
  unfiltered in a shell that has sourced `.env`.
- **Never pass `-v`, `--verbose`, or `--trace`** — those echo request headers, token included,
  straight into the tool output.
- **Never use Forgejo's `?token=` / `?access_token=` query parameter.** It works, which is why it's
  tempting; it also lands the credential in the server's access log and in shell history.
- If the token is missing, `fj` says so and exits. Ask the user to add it rather than falling back
  to reading the file, to `gh`, or to unauthenticated requests.

Forgejo tokens carry granular scopes (`read:issue`, `write:issue`, `read:repository`, …). A write
that fails on a resource you can clearly read usually means the token lacks the `write:` scope, not
that the request was malformed — surface that to the user rather than retrying variations.

## Request discipline

- **Never add `-f`.** `--fail` discards the response body, and Forgejo's body is where the actual
  error message lives. To see the status alongside it, append `-w '\n%{http_code}\n'`.
- **A 404 can mean "not permitted".** Forgejo returns 404 rather than 403 for resources a token
  can't see, so treat an unexpected 404 on a write as a scope or ownership question, not proof the
  issue doesn't exist.
- **Build JSON bodies with a quoted heredoc**, not an inline `-d "{...}"` string. Issue and comment
  bodies are markdown full of backticks, `$`, and quotes, all of which the shell will otherwise
  mangle or execute:

  ```bash
  .agents/skills/forgejo-api/scripts/fj -X POST --data @- '/repos/{repo}/issues/42/comments' <<'JSON'
  { "body": "Reproduced on `master` — `just typecheck` fails with $TS2307." }
  JSON
  ```

  Compose with `jq -n --arg body "$(cat file.md)" '{body: $body}'` when the text is long enough that
  escaping it by hand is a risk.

- **Pipe through `jq` to select fields.** Issue and PR objects are large and mostly irrelevant;
  fetching 50 raw objects to answer "which are open" wastes a great deal of context. Ask for what
  you need: `jq '.[] | {number, title, state, labels: [.labels[].name]}'`.

## Read code with git, metadata with the API

The `bitcart-git` remote is already configured, so for anything that is _content_ — a PR's diff, a
branch's files, whether a commit landed — fetch and use git locally (`git fetch bitcart-git`, then
ordinary `git diff`/`git log`). Reserve the API for what git cannot carry: issue and PR state,
titles, bodies, comments, labels, reviews, assignees, and Actions run status and job logs. Pulling a
large diff through the API as JSON is both slower and far more expensive in context than the local
clone you already have.

## Endpoint reference

[API.md](API.md) catalogs the endpoints for issues, pull requests, comments, labels, milestones,
reviews and Actions runs, plus the Gitea-inherited quirks that cause otherwise-correct requests to
fail. Read it before composing any call beyond a plain `GET` of a single issue — and always before
touching Actions, where no number in a run's web URL is an id the API accepts.

The instance serves its own authoritative OpenAPI spec at `https://git.bitcart.ai/api/swagger`
(machine-readable at `https://git.bitcart.ai/swagger.v1.json`). That spec, not memory of the GitHub
API, is the tiebreaker whenever a request returns 422 or a field is rejected — Forgejo's shapes
diverge from GitHub's in small, unguessable ways.
