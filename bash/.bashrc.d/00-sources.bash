# External sources and completions base
[[ -f ~/.local/share/omarchy/default/bash/rc ]] && source ~/.local/share/omarchy/default/bash/rc

# Git completions (different paths on Linux vs Mac)
if [[ -f /usr/share/bash-completion/completions/git ]]; then
  source /usr/share/bash-completion/completions/git
elif [[ -f /opt/homebrew/etc/bash_completion.d/git-completion.bash ]]; then
  source /opt/homebrew/etc/bash_completion.d/git-completion.bash
elif [[ -f /usr/local/etc/bash_completion.d/git-completion.bash ]]; then
  source /usr/local/etc/bash_completion.d/git-completion.bash
fi

[[ -f ~/.gh-completion.bash ]] && source ~/.gh-completion.bash
command -v op &>/dev/null && source <(op completion bash)
command -v hcloud &>/dev/null && source <(hcloud completion bash)

# Worktree helper
[[ -f ~/creations/bash-scripts/wt.sh ]] && source ~/creations/bash-scripts/wt.sh

# Cargo/Rust
[[ -f "$HOME/.cargo/env" ]] && . "$HOME/.cargo/env"
