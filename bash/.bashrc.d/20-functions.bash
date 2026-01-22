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

# Review diff with arbitrary branch
reb() {
  if [ -z "$1" ]; then
    echo "Usage: reb <branch>" >&2
    return 1
  fi
  lumen diff "${1}.."
}
