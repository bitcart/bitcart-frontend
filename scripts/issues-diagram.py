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


def build_deps_map(issues: list[dict]) -> dict[int, dict[str, list[int]]]:
    open_numbers = {i["number"] for i in issues}
    deps_map: dict[int, dict[str, list[int]]] = {}
    for issue in issues:
        deps = parse_dependencies(issue)
        # Only keep references to other open issues
        deps["depends_on"] = [n for n in deps["depends_on"] if n in open_numbers]
        deps["blocks"] = [n for n in deps["blocks"] if n in open_numbers]
        if deps["depends_on"] or deps["blocks"]:
            deps_map[issue["number"]] = deps
    return deps_map


# ── Mindmap generators ──


def generate_mindmap_simple(groups: dict[str, list[dict]]) -> str:
    lines = ["mindmap", "  root((Open Issues))"]
    for priority in PRIORITY_ORDER:
        items = groups[priority]
        if not items:
            continue
        display = PRIORITY_DISPLAY[priority]
        lines.append(f"    {display}")
        for issue in items:
            title = sanitize(issue["title"])
            lines.append(f"      #{issue['number']} {title}")
    return "\n".join(lines)


def generate_mindmap_with_deps(
    groups: dict[str, list[dict]], deps_map: dict[int, dict[str, list[int]]]
) -> str:
    lines = ["mindmap", "  root((Open Issues))"]
    for priority in PRIORITY_ORDER:
        items = groups[priority]
        if not items:
            continue
        display = PRIORITY_DISPLAY[priority]
        lines.append(f"    {display}")
        for issue in items:
            num = issue["number"]
            title = sanitize(issue["title"])
            dep_info = deps_map.get(num)
            if dep_info:
                annotations = []
                if dep_info["depends_on"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["depends_on"])
                    annotations.append(f"depends on {refs}")
                if dep_info["blocks"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["blocks"])
                    annotations.append(f"blocks {refs}")
                suffix = " | " + "; ".join(annotations)
            else:
                suffix = ""
            lines.append(f"      #{num} {title}{suffix}")
    return "\n".join(lines)


# ── Flowchart generators ──


def generate_flowchart_simple(groups: dict[str, list[dict]]) -> str:
    lines = ["flowchart TD"]
    for priority in PRIORITY_ORDER:
        items = groups[priority]
        if not items:
            continue
        display = PRIORITY_DISPLAY[priority]
        group_id = to_node_id(priority)
        lines.append(f"  subgraph {group_id}[{display}]")
        for issue in items:
            node_id = f"i{issue['number']}"
            title = sanitize(issue["title"])
            lines.append(f'    {node_id}["#{issue["number"]} {title}"]')
        lines.append("  end")
    return "\n".join(lines)


def generate_flowchart_with_deps(
    groups: dict[str, list[dict]], deps_map: dict[int, dict[str, list[int]]]
) -> str:
    lines = ["flowchart TD"]
    for priority in PRIORITY_ORDER:
        items = groups[priority]
        if not items:
            continue
        display = PRIORITY_DISPLAY[priority]
        group_id = to_node_id(priority)
        lines.append(f"  subgraph {group_id}[{display}]")
        for issue in items:
            node_id = f"i{issue['number']}"
            title = sanitize(issue["title"])
            lines.append(f'    {node_id}["#{issue["number"]} {title}"]')
        lines.append("  end")

    # Add dependency edges
    for num, deps in deps_map.items():
        for dep_num in deps["depends_on"]:
            lines.append(f"  i{dep_num} --> i{num}")
        for blocked_num in deps["blocks"]:
            lines.append(f"  i{num} --> i{blocked_num}")

    return "\n".join(lines)


# ── Priority cascade/tree generators ──


def generate_cascade(
    groups: dict[str, list[dict]], deps_map: dict[int, dict[str, list[int]]]
) -> str:
    """Flowchart with priority tiers chained top-to-bottom, dependency edges included."""
    lines = ["flowchart TD"]
    non_empty = [p for p in PRIORITY_ORDER if groups[p]]

    for priority in non_empty:
        items = groups[priority]
        display = PRIORITY_DISPLAY[priority]
        group_id = to_node_id(priority)
        lines.append(f"  subgraph {group_id}[{display}]")
        for issue in items:
            node_id = f"i{issue['number']}"
            title = sanitize(issue["title"])
            lines.append(f'    {node_id}["#{issue["number"]} {title}"]')
        lines.append("  end")

    # Chain priority subgraphs top-to-bottom
    for i in range(len(non_empty) - 1):
        src = to_node_id(non_empty[i])
        dst = to_node_id(non_empty[i + 1])
        lines.append(f"  {src} --> {dst}")

    # Add dependency edges
    for num, deps in deps_map.items():
        for dep_num in deps["depends_on"]:
            lines.append(f"  i{dep_num} -.->|blocks| i{num}")
        for blocked_num in deps["blocks"]:
            lines.append(f"  i{num} -.->|blocks| i{blocked_num}")

    return "\n".join(lines)


def generate_priority_tree(
    groups: dict[str, list[dict]], deps_map: dict[int, dict[str, list[int]]]
) -> str:
    """Tree where high priority is the root, each level branches into issues then into the next level."""
    lines = ["flowchart TD"]
    non_empty = [p for p in PRIORITY_ORDER if groups[p]]

    for priority in non_empty:
        group_id = to_node_id(priority)
        display = PRIORITY_DISPLAY[priority]
        lines.append(f'  {group_id}(("{display}"))')
        for issue in groups[priority]:
            node_id = f"i{issue['number']}"
            title = sanitize(issue["title"])
            lines.append(f'  {node_id}["#{issue["number"]} {title}"]')
            lines.append(f"  {group_id} --- {node_id}")

    # Connect priority levels as a spine
    for i in range(len(non_empty) - 1):
        src = to_node_id(non_empty[i])
        dst = to_node_id(non_empty[i + 1])
        lines.append(f"  {src} ==> {dst}")

    # Add dependency edges
    for num, deps in deps_map.items():
        for dep_num in deps["depends_on"]:
            lines.append(f"  i{dep_num} -.->|blocks| i{num}")
        for blocked_num in deps["blocks"]:
            lines.append(f"  i{num} -.->|blocks| i{blocked_num}")

    return "\n".join(lines)


def generate_tree(
    groups: dict[str, list[dict]], deps_map: dict[int, dict[str, list[int]]]
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
            dep_info = deps_map.get(issue["number"])
            dep_suffix = ""
            if dep_info:
                parts = []
                if dep_info["depends_on"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["depends_on"])
                    parts.append(f"depends on {refs}")
                if dep_info["blocks"]:
                    refs = ", ".join(f"#{n}" for n in dep_info["blocks"])
                    parts.append(f"blocks {refs}")
                dep_suffix = f"  [{'; '.join(parts)}]"
            lines.append(
                f"  {prefix}{item_branch} #{issue['number']} {title}{dep_suffix}"
            )
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
    deps_map = build_deps_map(issues)

    # Print tree to stdout
    tree = generate_tree(groups, deps_map)
    print(tree)

    # Generate all Mermaid variants
    mindmap_simple = generate_mindmap_simple(groups)
    mindmap_deps = generate_mindmap_with_deps(groups, deps_map)
    flowchart_simple = generate_flowchart_simple(groups)
    flowchart_deps = generate_flowchart_with_deps(groups, deps_map)
    cascade = generate_cascade(groups, deps_map)
    priority_tree = generate_priority_tree(groups, deps_map)

    # Write to output directory
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

    mindmap_md = f"""# Open Issues — Mindmap

## By Priority

```mermaid
{mindmap_simple}
```

## By Priority (with dependencies)

```mermaid
{mindmap_deps}
```
"""

    flowchart_md = f"""# Open Issues — Flowchart

## By Priority

```mermaid
{flowchart_simple}
```

## By Priority (with dependencies)

```mermaid
{flowchart_deps}
```
"""

    priority_md = f"""# Open Issues — Priority Hierarchy

## Cascade (priority tiers chained top-to-bottom)

```mermaid
{cascade}
```

## Tree (priority levels as a branching tree)

```mermaid
{priority_tree}
```
"""

    write_file(os.path.join(output_dir, "issues-mindmap.md"), mindmap_md)
    write_file(os.path.join(output_dir, "issues-flowchart.md"), flowchart_md)
    write_file(os.path.join(output_dir, "issues-priority.md"), priority_md)


if __name__ == "__main__":
    main()
