# Git checkout completion
__git_complete co _git_checkout

# reb branch completion
_reb_completions() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local branches=$(gt ls --no-interactive 2>/dev/null | grep -oE '[a-zA-Z0-9/_-]+/[a-zA-Z0-9/_-]+' | sort -u | tr '\n' ' ')
  COMPREPLY=($(compgen -W "${branches}" -- "${cur}"))
}
complete -F _reb_completions reb

# Graphite (gt) completion
_gt_yargs_completions() {
  local cur_word args type_list

  cur_word="${COMP_WORDS[COMP_CWORD]}"
  args=("${COMP_WORDS[@]}")

  type_list=$(gt --get-yargs-completions "${args[@]}")

  COMPREPLY=($(compgen -W "${type_list}" -- ${cur_word}))

  if [ ${#COMPREPLY[@]} -eq 0 ]; then
    COMPREPLY=()
  fi

  return 0
}
complete -o bashdefault -o default -F _gt_yargs_completions gt

# Ralph CLI completion
_ralph_completions() {
  local cur prev words cword
  _init_completion || return

  local commands="setup feature backlog cancel status help completions"

  case "${words[1]}" in
    setup)
      [[ ${cur} == -* ]] && COMPREPLY=( $(compgen -W "--max-iterations" -- "${cur}") )
      return ;;
    feature)
      if [[ ${cur} == -* ]]; then
        COMPREPLY=( $(compgen -W "--once" -- "${cur}") )
      elif [[ ${cword} -eq 2 ]]; then
        local features=$(ralph completions --list-features 2>/dev/null)
        COMPREPLY=( $(compgen -W "${features}" -- "${cur}") )
      fi
      return ;;
    backlog)
      [[ ${cur} == -* ]] && COMPREPLY=( $(compgen -W "--once --max-iterations --resume" -- "${cur}") )
      return ;;
    cancel|status|help) return ;;
    completions)
      [[ ${cword} -eq 2 ]] && COMPREPLY=( $(compgen -W "bash" -- "${cur}") )
      return ;;
  esac

  [[ ${cword} -eq 1 ]] && COMPREPLY=( $(compgen -W "${commands}" -- "${cur}") )
}
complete -F _ralph_completions ralph
