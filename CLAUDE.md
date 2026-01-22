# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a dotfiles repository managed with GNU Stow. Each top-level directory (bash, claude, git, hypr, nvim, cursor) is a "stow package" that gets symlinked to the home directory when you run `stow <package>` from this directory.

## Usage

```bash
# Install a package (creates symlinks in ~)
stow bash

# Install all packages
stow */

# Remove a package
stow -D bash

# Dry run to see what would happen
stow -n bash
```
