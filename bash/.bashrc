# Source all bashrc.d files
for file in ~/.bashrc.d/*.bash; do
  [[ -r "$file" ]] && source "$file"
done

# Source .env file
[[ -f ~/.env ]] && source ~/.env
