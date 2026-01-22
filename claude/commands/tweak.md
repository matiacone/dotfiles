---
description: Review and fix issues from annotations.txt
---

Review the annotations file at @annotations.txt which contains code review feedback and issues to address.

For each annotation:
1. Read the referenced file and line numbers
2. Understand the requested change from the comment
3. Make the necessary code changes to fix the issue
4. Verify the fix is complete

After all issues have been addressed:
1. Append the annotation contents to `.ralph/annotations.txt` to aggregate them (create the file if it doesn't exist)
2. Delete the original `annotations.txt` file
3. Stage the changed files with `git add <changed-files>`
4. Use /graphite:modify to amend staged changes to the current commit
5. Use /graphite:submit to push and update the PR

Work through each annotation systematically and confirm when complete.
