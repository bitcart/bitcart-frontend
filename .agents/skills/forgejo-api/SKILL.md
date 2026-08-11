---
name: forgejo-api
description: Read and update issues, pull requests, comments, labels and reviews on git.bitcart.ai via the Forgejo (Gitea-compatible) REST API, authenticating with FORGEJO_TOKEN without exposing it. Use whenever a task touches an issue or PR on git.bitcart.ai or the `bitcart-git` remote — reading one, commenting, editing, labelling, closing, opening a PR, fetching a diff — and use it *instead of* `gh` or the GitHub API, which talk to the `origin` GitHub mirror and cannot see Forgejo issues or PRs at all. Also triggers on a bare issue/PR number or a git.bitcart.ai URL when the surrounding work is about the Bitcart forge.
---

# Calling the Forgejo API on git.bitcart.ai

## You are on the wrong forge by default

Bitcart repos have two remotes: `origin` pointing at a GitHub mirror, and `bitcart-git` pointing at
`git.bitcart.ai`, which is the forge that actually hosts issues and pull requests. `gh` is installed
here and will happily answer questions about GitHub, so the failure mode is silent and confident: you
ask for issue #42, `gh` returns a _different_ issue #42 from the mirror, or reports it missing, and
nothing about the output says you queried the wrong host. **Never use `gh`, `gh api`, or
`api.github.com` for Bitcart issue and PR work.** There is no Forgejo CLI installed (`tea` is
absent), so `curl` against the REST API is the mechanism.

Derive owner and repo from the remote rather than hardcoding, so this works across Bitcart repos:

```bash
git remote get-url bitcart-git   # ssh://git@git.bitcart.ai/bitcart/bitcart-frontend.git
```

The API root is `https://git.bitcart.ai/api/v1`, and paths take the form
`/repos/{owner}/{repo}/...` — for this repo, `/repos/bitcart/bitcart-frontend/...`.

## Authenticate without leaking the token

`FORGEJO_TOKEN` lives in the repo-root `.env`. **Do not read, cat, grep or otherwise open `.env`** —
that pastes a live credential into the transcript permanently. Source it into the environment
instead, and because shell state does not persist between tool calls, prefix _every_ request with
that sourcing step:

```bash
set -a && . "$(git rev-parse --show-toplevel)/.env" && set +a &&
  curl -sS -H "Authorization: token $FORGEJO_TOKEN" \
    "https://git.bitcart.ai/api/v1/repos/bitcart/bitcart-frontend/issues?state=open&type=issues"
```

Rules that follow from the token being secret, each of which is a way to leak it by accident:

- **Never `echo`, print, or interpolate the token into a message**, and never run `env`, `set`, or
  `printenv` unfiltered in a shell that has sourced `.env`.
- **Never pass `-v`, `--verbose`, or `--trace` to `curl`** — those echo request headers, token
  included, straight into the tool output.
- **Never use Forgejo's `?token=` / `?access_token=` query parameter.** It works, which is why it's
  tempting; it also lands the credential in the server's access log and in shell history. Use the
  `Authorization` header.
- If `$FORGEJO_TOKEN` comes back empty, say so and ask the user to add it. Do not fall back to
  reading the file, to `gh`, or to unauthenticated requests.

Forgejo tokens carry granular scopes (`read:issue`, `write:issue`, `read:repository`, …). A write
that fails on a resource you can clearly read usually means the token lacks the `write:` scope, not
that the request was malformed — surface that to the user rather than retrying variations.

## Request discipline

- **Use `-sS`, never `-f`.** `--fail` discards the response body, and Forgejo's body is where the
  actual error message lives. To see the status alongside it, append `-w '\n%{http_code}\n'`.
- **A 404 can mean "not permitted".** Forgejo returns 404 rather than 403 for resources a token
  can't see, so treat an unexpected 404 on a write as a scope or ownership question, not proof the
  issue doesn't exist.
- **Send `-H 'Content-Type: application/json'` on every POST/PATCH/PUT.** Without it the body is
  ignored and you get a confusing 422 or a silent no-op.
- **Build JSON bodies with a quoted heredoc**, not an inline `-d "{...}"` string. Issue and comment
  bodies are markdown full of backticks, `$`, and quotes, all of which the shell will otherwise
  mangle or execute:

  ```bash
  set -a && . "$(git rev-parse --show-toplevel)/.env" && set +a &&
    curl -sS -X POST -H "Authorization: token $FORGEJO_TOKEN" \
      -H "Content-Type: application/json" --data @- \
      "https://git.bitcart.ai/api/v1/repos/bitcart/bitcart-frontend/issues/42/comments" <<'JSON'
  { "body": "Reproduced on `master` — `just typecheck` fails with $TS2307." }
  JSON
  ```

  Compose the JSON with `jq -n --arg body "$(cat file.md)" '{body: $body}'` when the text is long
  enough that escaping it by hand is a risk.

- **Pipe through `jq` to select fields.** Issue and PR objects are large and mostly irrelevant;
  fetching a list of 50 raw objects to answer "which are open" wastes a great deal of context. Ask
  for what you need: `jq '.[] | {number, title, state, labels: [.labels[].name]}'`.

## Read code with git, metadata with the API

The `bitcart-git` remote is already configured, so for anything that is _content_ — a PR's diff, a
branch's files, whether a commit landed — fetch and use git locally (`git fetch bitcart-git`, then
ordinary `git diff`/`git log`). Reserve the API for what git cannot carry: issue and PR state,
titles, bodies, comments, labels, reviews, assignees. Pulling a large diff through the API as JSON is
both slower and far more expensive in context than the local clone you already have.

## Endpoint reference

[API.md](API.md) catalogs the endpoints for issues, pull requests, comments, labels, milestones and
reviews, plus the Gitea-inherited quirks that cause otherwise-correct requests to fail. Read it
before composing any call beyond a plain `GET` of a single issue.

The instance serves its own authoritative OpenAPI spec at `https://git.bitcart.ai/api/swagger`
(machine-readable at `https://git.bitcart.ai/swagger.v1.json`). That spec, not memory of the GitHub
API, is the tiebreaker whenever a request returns 422 or a field is rejected — Forgejo's shapes
diverge from GitHub's in small, unguessable ways.
