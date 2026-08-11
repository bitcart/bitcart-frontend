# Forgejo API endpoint reference

Paths below are relative to `https://git.bitcart.ai/api/v1`, and `{owner}/{repo}` comes from the
`bitcart-git` remote. Every call needs the `Authorization: token $FORGEJO_TOKEN` header from
[SKILL.md](SKILL.md). Where a shape here disagrees with `https://git.bitcart.ai/swagger.v1.json`, the
instance's spec wins — check it whenever a call returns 422.

## Issues and PRs share one numbering space

This is the quirk that breaks the most requests, and it's inherited from Gitea: an issue and a pull
request cannot both be `#42`, because both draw from a single per-repo counter. Two consequences:

- `GET /repos/{owner}/{repo}/issues/{index}` resolves a PR too, returning it as an issue object with
  a non-null `pull_request` field. Use that field to tell them apart.
- **Everything conversational about a PR — comments, labels, assignees, closing it — goes through
  the `/issues/` path, not `/pulls/`.** There is no `/pulls/{index}/comments` for ordinary PR
  comments. The `/pulls/` endpoints cover only genuinely PR-shaped concerns: the diff, the branches,
  merging, and reviews.

## Issues

| Action           | Request                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| List             | `GET /repos/{owner}/{repo}/issues?state=open\|closed\|all&type=issues\|pulls&labels=bug,ui&q=text&page=1&limit=50`      |
| Get one          | `GET /repos/{owner}/{repo}/issues/{index}`                                                                              |
| Create           | `POST /repos/{owner}/{repo}/issues` — `{"title": …, "body": …, "labels": [1,2], "assignees": ["user"], "milestone": 3}` |
| Edit             | `PATCH /repos/{owner}/{repo}/issues/{index}` — any of `title`, `body`, `state`, `assignees`, `milestone`, `due_date`    |
| Search all repos | `GET /repos/issues/search?q=text&state=open&type=issues&owner=bitcart`                                                  |
| Timeline         | `GET /repos/{owner}/{repo}/issues/{index}/timeline`                                                                     |

- **`state` defaults to `open`.** Pass `state=all` when the answer might be a closed issue —
  otherwise "no such issue" is an artifact of the default, not a fact.
- **`type` defaults to both.** An unfiltered list mixes issues and PRs together; pass
  `type=issues` or `type=pulls` unless you want both.
- **Closing is a `PATCH`, not a verb endpoint.** `{"state": "closed"}` — there is no `/close`.
  Reopening is the same call with `"open"`.
- **`PATCH` with `body` replaces the entire body.** To append, `GET` the issue, concatenate, and send
  the whole thing back. There is no partial-body edit.
- `assignees` is an array of usernames and replaces the current set. The singular `assignee` field is
  deprecated; don't use it.

## Comments

| Action           | Request                                                              |
| ---------------- | -------------------------------------------------------------------- |
| List on issue/PR | `GET /repos/{owner}/{repo}/issues/{index}/comments`                  |
| Create           | `POST /repos/{owner}/{repo}/issues/{index}/comments` — `{"body": …}` |
| Edit             | `PATCH /repos/{owner}/{repo}/issues/comments/{id}` — `{"body": …}`   |
| Delete           | `DELETE /repos/{owner}/{repo}/issues/comments/{id}`                  |

**Note the path change between creating and editing.** Create is addressed by issue _index_; edit and
delete are addressed by global comment _id_ with no index in the path at all. Mixing them up yields a
404 that looks like a missing issue. The `id` comes from the list response, not from the issue number.

## Labels and milestones

| Action           | Request                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| List repo labels | `GET /repos/{owner}/{repo}/labels`                                       |
| Add to issue     | `POST /repos/{owner}/{repo}/issues/{index}/labels` — `{"labels": [1,2]}` |
| Replace on issue | `PUT /repos/{owner}/{repo}/issues/{index}/labels` — `{"labels": [1,2]}`  |
| Remove one       | `DELETE /repos/{owner}/{repo}/issues/{index}/labels/{label_id}`          |
| List milestones  | `GET /repos/{owner}/{repo}/milestones?state=all`                         |

**Resolve names to numeric IDs first.** Newer Forgejo versions accept label names in the `labels`
array, but IDs work on every version, so `GET /labels` and map the name yourself rather than
discovering the difference through a 422. `milestone` on an issue is likewise an ID, never a title.

`POST` adds to the existing labels; `PUT` replaces them wholesale. Reaching for `PUT` when you meant
to add one label silently strips every other label off the issue.

## Pull requests

| Action        | Request                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| List          | `GET /repos/{owner}/{repo}/pulls?state=open\|closed\|all&base=master&sort=recentupdate`               |
| Get one       | `GET /repos/{owner}/{repo}/pulls/{index}`                                                             |
| Create        | `POST /repos/{owner}/{repo}/pulls` — `{"head": "branch", "base": "master", "title": …, "body": …}`    |
| Edit          | `PATCH /repos/{owner}/{repo}/pulls/{index}` — `title`, `body`, `state`, `base`, `assignees`, `labels` |
| Diff / patch  | `GET /repos/{owner}/{repo}/pulls/{index}.diff` and `.patch`                                           |
| Changed files | `GET /repos/{owner}/{repo}/pulls/{index}/files`                                                       |
| Is it merged? | `GET /repos/{owner}/{repo}/pulls/{index}/merge` → 204 merged, 404 not                                 |
| Merge         | `POST /repos/{owner}/{repo}/pulls/{index}/merge` — `{"Do": "merge"\|"rebase"\|"squash"}`              |

- **The merge body's field is `Do`, capitalized.** Lowercase `do` is rejected. `Do` is required;
  `MergeTitleField` and `MergeMessageField` are the optional message overrides.
- **Merging is destructive and outward-facing — confirm with the user before calling it**, even when
  the surrounding task implies it. The same goes for closing someone else's PR or issue.
- `head` may be `branch` for a same-repo PR or `user:branch` from a fork.
- For reading a diff, prefer local git (see SKILL.md) — `.diff` exists for when you have no clone.

## Reviews

| Action            | Request                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List              | `GET /repos/{owner}/{repo}/pulls/{index}/reviews`                                                                                                                                   |
| Create            | `POST /repos/{owner}/{repo}/pulls/{index}/reviews` — `{"event": "APPROVED"\|"REQUEST_CHANGES"\|"COMMENT", "body": …, "comments": [{"path": "…", "body": "…", "new_position": 12}]}` |
| Get comments      | `GET /repos/{owner}/{repo}/pulls/{index}/reviews/{id}/comments`                                                                                                                     |
| Request reviewers | `POST /repos/{owner}/{repo}/pulls/{index}/requested_reviewers` — `{"reviewers": ["user"]}`                                                                                          |

- **`REQUEST_CHANGES` and `APPROVED` both require a non-empty `body`**; only `COMMENT` may omit it.
- **You cannot approve your own PR.** If the token belongs to the PR author, Forgejo rejects
  `APPROVED` — post `COMMENT` instead of trying to work around it.
- Inline comments anchor with `new_position` (line in the new file) or `old_position`, and a `path`
  that must match the diff exactly. A wrong path is accepted but the comment lands nowhere useful.

## Pagination

`page` is 1-based and `limit` is capped by the instance (commonly 50; the default page size is
smaller still, around 30). **A single request is very unlikely to return everything.**

Page until a response returns fewer items than `limit`:

```bash
page=1; while :; do
  n=$(curl -sS -H "Authorization: token $FORGEJO_TOKEN" \
    ".../issues?state=all&type=issues&limit=50&page=$page" | tee "/tmp/p$page.json" | jq length)
  [ "$n" -lt 50 ] && break
  page=$((page + 1))
done
```

The response also carries an `X-Total-Count` header, but reading it means `-i`/`-D`, which then
requires stripping the header block before `jq`. Counting returned items is simpler and avoids
putting response headers into the output.

## Other useful endpoints

- `GET /user` — who the token belongs to. The cheapest way to verify auth works and to learn the
  login you need for self-approval and assignee checks.
- `GET /repos/{owner}/{repo}` — repo metadata, including `default_branch`.
- `GET /repos/{owner}/{repo}/releases` and `/tags` — releases and tags.
- `GET /repos/{owner}/{repo}/commits?sha={branch}` — commit list when a clone isn't available.
