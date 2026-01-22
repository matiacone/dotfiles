# External sources and completions base
source ~/.local/share/omarchy/default/bash/rc
source /usr/share/bash-completion/completions/git
source ~/.gh-completion.bash
source <(op completion bash)
source <(hcloud completion bash)

# Worktree helper
source ~/creations/bash-scripts/wt.sh

# Cargo/Rust
[[ -f "$HOME/.cargo/env" ]] && . "$HOME/.cargo/env"
