# Source all bashrc.d files
for file in ~/.bashrc.d/*.bash; do
  [[ -r "$file" ]] && source "$file"
done

# Source .env file
[[ -f ~/.env ]] && source ~/.env
export PATH="$HOME/.npm-global/bin:$PATH"

# Homebrew
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"

. "$HOME/.local/share/../bin/env"

# OpenClaw Completion
source "/home/mathew/.openclaw/completions/openclaw.bash"

# The next line updates PATH for the Google Cloud SDK.
if [ -f '/tmp/google-cloud-sdk/path.bash.inc' ]; then . '/tmp/google-cloud-sdk/path.bash.inc'; fi
