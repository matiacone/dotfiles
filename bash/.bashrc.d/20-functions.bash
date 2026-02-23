# Copy pipe to clipboard
cpo() {
  if [ -t 0 ]; then
    echo "Error: No input piped to cpo" >&2
    return 1
  else
    if [[ "$OSTYPE" == "darwin"* ]]; then
      pbcopy
    else
      wl-copy
    fi
    echo "Content copied to clipboard" >&2
  fi
}

# Kimi (Claude via Moonshot API)
kimi() {
  export ANTHROPIC_BASE_URL=https://api.moonshot.ai/anthropic
  export ANTHROPIC_AUTH_TOKEN=$KIMI_API_KEY
  claude "$@"
}

# lumen diff wrapper that excludes .pen files
_ld() {
  local ref="$1"
  shift
  local file_args=()
  while IFS= read -r f; do
    file_args+=(--file "$f")
  done < <(git diff --name-only "$ref" 2>/dev/null | grep -v '\.pen$')
  if [ ${#file_args[@]} -eq 0 ]; then
    echo "No non-.pen files changed"
    return 0
  fi
  lumen diff "$ref" "${file_args[@]}" "$@"
}

# Review diff with arbitrary branch
reb() {
  if [ -z "$1" ]; then
    echo "Usage: reb <branch>" >&2
    return 1
  fi
  _ld "${1}.."
}
