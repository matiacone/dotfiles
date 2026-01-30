# Filesystem
alias h="cd ~"
alias c="cd ~/creations"
alias d="cd ~/creations/deal-deploy"
alias d2="cd ~/creations/deal-deploy-2/"
alias da="cd ~/creations/deal-deploy/apps/deal-deploy"
alias da2="cd ~/creations/deal-deploy-2/apps/deal-deploy"
alias de="cd ~/creations/deal-deploy/packages/backend"
alias de2="cd ~/creations/deal-deploy-2/packages/backend"
alias me="cd ~/creations/me/"
alias bc="n ~/dotfiles/bash/"
alias brc="source ~/.bashrc"

# Git
alias gs='git status'
alias gr="git log --graph --remotes --decorate --oneline"
alias ca='function _ca(){ git add . && git commit -m "$*"; }; _ca'
alias co='git checkout'
alias pl="git pull --prune"
alias po="git push"
alias pf="git push --force-with-lease"
alias pop='git stash pop'

# Graphite
alias ma='gt modify -a && gt submit --no-interactive -p'
alias ga='function _ca(){ gt create -am "$*" && gt submit --no-interactive -p; }; _ca'
alias re='lumen diff develop..'
alias res='lumen diff develop.. --stacked'
alias red='lumen diff $(gt branch info --no-interactive 2>/dev/null | grep -o "Parent: .*" | sed "s/Parent: //")..'
alias devin-review='bunx devin-review "$(gh pr view --json url -q .url)"'

# Bun
alias run="bun run"
alias cc="claude"

# SSH (uses env vars from .env)
alias ssh-flow-ubuntu='ssh -i ~/.ssh/id_rsa_flow ubuntu@$SSH_FLOW_HOST'
alias ssh-flow='ssh -i ~/.ssh/id_rsa_flow miacone@$SSH_FLOW_HOST'
alias ssh-hobby='ssh -i ~/.ssh/id_deal_deploy miacone@$SSH_HOBBY_HOST'
alias ssh-dd='ssh -i ~/.ssh/id_deal_deploy miacone@$SSH_DD_HOST'

# System
if [[ "$OSTYPE" == "darwin"* ]]; then
  alias memhogs='ps aux -m | head -15'
else
  alias memhogs='ps aux --sort=-%mem | head -15'
fi
