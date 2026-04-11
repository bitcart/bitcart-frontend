# /// script
# requires-python = ">=3.12"
# dependencies = ["httpx"]
# ///
"""Generate Mermaid diagrams of open Forgejo issues grouped by priority."""

import os
import re

import httpx  # type: ignore

OWNER = "bitcart"
REPO = "bitcart-frontend"
BASE_URL = f"https://git.bitcart.ai/api/v1/repos/{OWNER}/{REPO}/issues"

PRIORITY_ORDER = [
    "priority:high",
    "priority:medium",
    "priority:medium-minus",
    "priority:low",
    "backlog",
    "uncategorized",
]

PRIORITY_DISPLAY = {
    "priority:high": "High",
    "priority:medium": "Medium",
    "priority:medium-minus": "Medium-minus",
    "priority:low": "Low",
    "backlog": "Backlog",
    "uncategorized": "Uncategorized",
}

DEP_PATTERNS = [
    (
        re.compile(r"(?:depends on|blocked by|after|requires)\s+#(\d+)", re.IGNORECASE),
        "depends_on",
    ),
    (re.compile(r"(?:blocks|before)\s+#(\d+)", re.IGNORECASE), "blocks"),
]

BLOCKED_LABELS = {"blocked", "status/blocked"}

MERMAID_CLASSES = """\
  classDef blocked fill:#f5f5f5,stroke:#999,color:#999,stroke-dasharray:5 5
  classDef blocked_ext fill:#fff8e1,stroke:#f9a825,color:#f57f17,stroke-dasharray:5 5
  classDef assigned fill:#e8f4fd,stroke:#0969da
  classDef actionable fill:#d4edda,stroke:#28a745"""


def get_token() -> str | None:
    return os.environ.get("FORGEJO_TOKEN")


def fetch_all_issues(token: str | None) -> list[dict]:
    issues: list[dict] = []
    page = 1
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    with httpx.Client(timeout=30) as client:
        while True:
            resp = client.get(
                BASE_URL,
                params={"state": "open", "type": "issues", "limit": 50, "page": page},
                headers=headers,
            )
            resp.raise_for_status()
            batch = resp.json()
            if not batch:
                break
            issues.extend(batch)
            page += 1
    return issues


def fetch_api_dependencies(
    issues: list[dict], token: str | None
) -> dict[int, list[int]]:
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    deps: dict[int, list[int]] = {}
    with httpx.Client(timeout=30) as client:
        for issue in issues:
            num = issue["number"]
            resp = client.get(f"{BASE_URL}/{num}/dependencies", headers=headers)
            if resp.status_code == 200:
                dep_numbers = [d["number"] for d in (resp.json() or [])]
                if dep_numbers:
                    deps[num] = dep_numbers
    return deps


def classify_priority(issue: dict) -> str:
    label_names = [lb["name"] for lb in issue.get("labels", [])]
    for p in PRIORITY_ORDER[:-1]:  # skip "uncategorized"
        if p in label_names:
            return p
    return "uncategorized"


def parse_dependencies(issue: dict) -> dict[str, list[int]]:
    body = issue.get("body") or ""
    deps: dict[str, list[int]] = {"depends_on": [], "blocks": []}
    for pattern, kind in DEP_PATTERNS:
        for m in pattern.finditer(body):
            deps[kind].append(int(m.group(1)))
    return deps


def sanitize(text: str) -> str:
    """Sanitize text for use inside Mermaid node labels."""
    return text.replace('"', "'").replace("\n", " ").replace("[", "(").replace("]", ")")


def to_node_id(priority: str) -> str:
    """Convert a priority key to a valid Mermaid node ID."""
    return priority.replace(":", "_").replace("-", "_")


def group_issues(issues: list[dict]) -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = {p: [] for p in PRIORITY_ORDER}
    for issue in issues:
        priority = classify_priority(issue)
        groups[priority].append(issue)
    return groups


def build_deps_map(
    issues: list[dict], api_deps: dict[int, list[int]]
) -> dict[int, dict[str, list[int]]]:
    open_numbers = {i["number"] for i in issues}
    raw: dict[int, dict[str, set[int]]] = {}
    for issue in issues:
        num = issue["number"]
        text_deps = parse_dependencies(issue)
        depends_on = {n for n in text_deps["depends_on"] if n in open_numbers}
        depends_on |= {n for n in api_deps.get(num, []) if n in open_numbers}
        blocks = {n for n in text_deps["blocks"] if n in open_numbers}
        raw[num] = {"depends_on": depends_on, "blocks": blocks}
    for num, deps in list(raw.items()):
        for dep_num in deps["depends_on"]:
            raw[dep_num]["blocks"].add(num)
        for blocked_num in deps["blocks"]:
            raw[blocked_num]["depends_on"].add(num)

    return {
        num: {
            "depends_on": sorted(deps["depends_on"]),
            "blocks": sorted(deps["blocks"]),
        }
        for num, deps in raw.items()
        if deps["depends_on"] or deps["blocks"]
    }


# ── Status helpers ──


def get_assignees(issue: dict) -> list[str]:
    return [a["login"] for a in (issue.get("assignees") or []) if a.get("login")]


def has_blocked_label(issue: dict) -> bool:
    label_names = {lb["name"] for lb in issue.get("labels", [])}
    return bool(label_names & BLOCKED_LABELS)


def find_blocked(
    issues: list[dict], deps_map: dict[int, dict[str, list[int]]]
) -> dict[int, str]:
    blocked: dict[int, str] = {}
    for num, deps in deps_map.items():
        if deps["depends_on"]:
            blocked[num] = "dep"
    for issue in issues:
        if has_blocked_label(issue):
            num = issue["number"]
            blocked[num] = "both" if num in blocked else "ext"
    return blocked


def status_suffix(issue: dict, blocked: dict[int, str]) -> str:
    num = issue["number"]
    assignees = get_assignees(issue)
    parts: list[str] = []
    reason = blocked.get(num)
    if reason == "ext":
        parts.append("BLOCKED (ext)")
    elif reason:
        parts.append("BLOCKED")
    if assignees:
        parts.append(", ".join(f"@{a}" for a in assignees))
    if not parts:
        return ""
    return " [" + " | ".join(parts) + "]"


def status_class(issue: dict, blocked: dict[int, str]) -> str:
    reason = blocked.get(issue["number"])
    if reason == "ext":
        return "blocked_ext"
    if reason:
        return "blocked"
    if get_assignees(issue):
        return "assigned"
    return "actionable"


# ── Diagram generators ──


def generate_dep_graph(
    issues: list[dict],
    deps_map: dict[int, dict[str, list[int]]],
    blocked: dict[int, str],
) -> str | None:
    """Focused graph showing only issues involved in dependencies."""
    involved: set[int] = set()
    for num, deps in deps_map.items():
        involved.add(num)
        involved.update(deps["depends_on"])
        involved.update(deps["blocks"])

    if not involved:
        return None

    issue_lookup = {i["number"]: i for i in issues}
    lines = ["flowchart TD", MERMAID_CLASSES]

    for num in sorted(involved):
        issue = issue_lookup.get(num)
        if not issue:
            continue
        node_id = f"i{num}"
        title = sanitize(issue["title"])
        suffix = status_suffix(issue, blocked)
        css_class = status_class(issue, blocked)
        lines.append(f'  {node_id}["#{num} {title}{suffix}"]:::{css_class}')

    for num, deps in deps_map.items():
        for dep_num in deps["depends_on"]:
            lines.append(f"  i{dep_num} -->|blocks| i{num}")

    return "\n".join(lines)


def generate_priority_tree(
    groups: dict[str, list[dict]],
    blocked: dict[int, str],
) -> str:
    """Tree where priority nodes branch into issues, compact layout."""
    lines = ["flowchart TD", MERMAID_CLASSES]
    non_empty = [p for p in PRIORITY_ORDER if groups[p]]

    for priority in non_empty:
        group_id = to_node_id(priority)
        display = PRIORITY_DISPLAY[priority]
        lines.append(f'  {group_id}(("{display}"))')
        for issue in groups[priority]:
            node_id = f"i{issue['number']}"
            title = sanitize(issue["title"])
            suffix = status_suffix(issue, blocked)
            css_class = status_class(issue, blocked)
            lines.append(
                f'  {node_id}["#{issue["number"]} {title}{suffix}"]:::{css_class}'
            )
            lines.append(f"  {group_id} --- {node_id}")

    for i in range(len(non_empty) - 1):
        src = to_node_id(non_empty[i])
        dst = to_node_id(non_empty[i + 1])
        lines.append(f"  {src} ==> {dst}")

    return "\n".join(lines)


def generate_tree(
    groups: dict[str, list[dict]],
    deps_map: dict[int, dict[str, list[int]]],
    blocked: dict[int, str],
) -> str:
    """Generate a plain-text tree view of issues grouped by priority."""
    lines = ["Open Issues"]
    non_empty = [(p, groups[p]) for p in PRIORITY_ORDER if groups[p]]
    for idx, (priority, items) in enumerate(non_empty):
        is_last_group = idx == len(non_empty) - 1
        branch = "\u2514\u2500\u2500" if is_last_group else "\u251c\u2500\u2500"
        prefix = "    " if is_last_group else "\u2502   "
        display = PRIORITY_DISPLAY[priority]
        lines.append(f"  {branch} {display} ({len(items)})")
        for j, issue in enumerate(items):
            is_last_issue = j == len(items) - 1
            item_branch = (
                "\u2514\u2500\u2500" if is_last_issue else "\u251c\u2500\u2500"
            )
            title = issue["title"]
            num = issue["number"]

            markers: list[str] = []
            if num in blocked:
                markers.append("BLOCKED")
            assignees = get_assignees(issue)
            if assignees:
                markers.append(", ".join(f"@{a}" for a in assignees))
            dep_info = deps_map.get(num)
            if dep_info:
                if dep_info["depends_on"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["depends_on"])
                    markers.append(f"depends on {refs}")
                if dep_info["blocks"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["blocks"])
                    markers.append(f"blocks {refs}")
            suffix = f"  [{'; '.join(markers)}]" if markers else ""
            lines.append(f"  {prefix}{item_branch} #{num} {title}{suffix}")

    actionable: list[tuple[str, dict]] = []
    for priority in PRIORITY_ORDER:
        for issue in groups[priority]:
            num = issue["number"]
            if num not in blocked and not get_assignees(issue):
                actionable.append((priority, issue))

    if actionable:
        lines.append("")
        lines.append("Actionable (not blocked, not assigned):")
        for priority, issue in actionable:
            display = PRIORITY_DISPLAY[priority]
            lines.append(f"  [{display}] #{issue['number']} {issue['title']}")

    return "\n".join(lines)


def write_file(path: str, content: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Wrote {path}")


def main() -> None:
    token = get_token()
    if not token:
        print(
            "Warning: FORGEJO_TOKEN not set, using unauthenticated requests (may be rate-limited)"
        )

    print("Fetching open issues...")
    issues = fetch_all_issues(token)
    print(f"Found {len(issues)} open issues\n")

    groups = group_issues(issues)
    print("Fetching issue dependencies from API...")
    api_deps = fetch_api_dependencies(issues, token)
    deps_map = build_deps_map(issues, api_deps)
    blocked = find_blocked(issues, deps_map)

    # Print tree to stdout
    tree = generate_tree(groups, deps_map, blocked)
    print(tree)

    # Generate Mermaid diagrams
    priority_tree = generate_priority_tree(groups, blocked)
    dep_graph = generate_dep_graph(issues, deps_map, blocked)

    # Write to output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

    sections = [
        f"""# Open Issues

## Priority Tree

```mermaid
{priority_tree}
```"""
    ]

    if dep_graph:
        sections.append(f"""
## Dependencies

```mermaid
{dep_graph}
```""")

    write_file(os.path.join(output_dir, "issues.md"), "\n".join(sections) + "\n")


if __name__ == "__main__":
    main()
