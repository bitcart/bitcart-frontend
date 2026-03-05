function normalize_trailing_space(line) {
  sub(/[[:space:]]+$/, " ", line)
  return line
}

function render_doc_line(line) {
  sub(/^[[:space:]]*#[[:space:]]?/, "", line)

  # blank line inside doc block
  if (line ~ /^[[:space:]]*$/) {
    if (!doc_started) return   # remove first trailing newline
    print ""
    return
  }

  doc_started=1

  while (match(line, /`[^`]+`/)) {
    code = substr(line, RSTART+1, RLENGTH-2)
    line = substr(line, 1, RSTART-1) gray code reset green substr(line, RSTART+RLENGTH)
  }

  line = normalize_trailing_space(line)
  print " " green line reset
}

# Remove header line
/^Available recipes:[[:space:]]*$/ {
  next
}

# Comment block
/^[[:space:]]*#/ {
  if (!in_block) {
    print ""
    doc_started=0
  }
  in_block=1
  render_doc_line($0)
  next
}

# Section headers
/^[[:space:]]*\[[^]]+\][[:space:]]*$/ {
  if (in_block) print ""
  in_block=0

  line = $0
  sub(/^[[:space:]]*\[/, "", line)
  sub(/\][[:space:]]*$/, ":", line)

  print ""
  print yellow line reset
  next
}

# Recipe lines
{
  if (in_block) print ""
  in_block=0

  line = normalize_trailing_space($0)

  split(line, parts, "#")
  cmd_part = parts[1]

  desc_part = ""
  if (length(parts) > 1) {
    desc_part = substr(line, length(cmd_part) + 1)
  }

  cmd_body = cmd_part
  sub(/^[[:space:]]+/, "", cmd_body)

  n = split(cmd_body, tokens, /[[:space:]]+/)

  if (n > 1) {
    recipe = tokens[1]
    args = substr(cmd_body, length(recipe) + 1)
    printf "  %s%s%s%s%s%s\n",
           white, recipe, reset,
           blue, args, reset
  } else {
    print "  " white cmd_body reset
  }
}

END {
  if (in_block) print ""
}
