# Editor
export SUDO_EDITOR="$EDITOR"

# Claude
export KIMI_API_KEY="$KIMI_KEY"
CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR=1

# 1Password SSH agent
export SSH_AUTH_SOCK=~/.1password/agent.sock

# Fizzy CLI
export FIZZY_ACCOUNT="${FIZZY_ACCOUNT:-}"

# PATH additions
export BUN_INSTALL="$HOME/.bun"
export PNPM_HOME="/home/mathew/.local/share/pnpm"

export PATH="$BUN_INSTALL/bin:$PATH"
export PATH="$HOME/.slack/bin:$PATH"
export PATH="$PATH:/home/mathew/.turso"
export PATH="/home/mathew/.opencode/bin:$PATH"
export PATH="$HOME/.local/share/gem/ruby/3.4.0/bin:$PATH"
export PATH="/home/mathew/.local/bin:$PATH"

case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
