-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

-- Ctrl+/ to toggle comment (like VS Code)
vim.keymap.set("n", "<C-/>", "gcc", { remap = true, desc = "Toggle comment" })
vim.keymap.set("v", "<C-/>", "gc", { remap = true, desc = "Toggle comment" })

-- Ctrl+A to select all
vim.keymap.set("n", "<C-a>", "ggVG", { desc = "Select all" })

-- jj to escape insert mode
vim.keymap.set("i", "jj", "<Esc>", { desc = "Exit insert mode" })
vim.keymap.set("t", "jj", "<C-\\><C-n>", { desc = "Exit terminal mode" })

-- Make word operations work on inner word by default
vim.keymap.set("n", "cw", "ciw", { desc = "Change inner word" })
vim.keymap.set("n", "dw", "diw", { desc = "Delete inner word" })
vim.keymap.set("n", "yw", "yiw", { desc = "Yank inner word" })

-- Ctrl+L to clear terminal (set on TermOpen to override plugin mappings)
vim.api.nvim_create_autocmd("TermOpen", {
	callback = function()
		vim.keymap.set("t", "<C-l>", function()
			vim.fn.chansend(vim.b.terminal_job_id, "\x0c")
		end, { buffer = 0, desc = "Clear terminal" })
	end,
})

-- Toggle terminal with Ctrl+`
vim.keymap.set({ "n", "t" }, "<C-`>", function()
	Snacks.terminal.toggle()
end, { desc = "Toggle terminal" })

-- Center after navigation
vim.keymap.set("n", "<C-u>", "<C-u>zz")
vim.keymap.set("n", "<C-d>", "<C-d>zz")
vim.keymap.set("n", "{", "{zz")
vim.keymap.set("n", "}", "}zz")
vim.keymap.set("n", "N", "Nzz")
vim.keymap.set("n", "n", "nzz")
vim.keymap.set("n", "G", "Gzz")
vim.keymap.set("n", "gg", "ggzz")
vim.keymap.set("n", "<C-i>", "<C-i>zz")
vim.keymap.set("n", "<C-o>", "<C-o>zz")
vim.keymap.set("n", "%", "%zz")
vim.keymap.set("n", "*", "*zz")
vim.keymap.set("n", "#", "#zz")
vim.keymap.set("n", "gd", "gdzz")

-- H/L for line start/end
vim.keymap.set("n", "L", "$")
vim.keymap.set("n", "H", "^")
vim.keymap.set("v", "L", "$<left>")
vim.keymap.set("v", "H", "^")

-- Tab/Ctrl-Tab for buffer navigation
vim.keymap.set("n", "<Tab>", ":bnext<CR>", { desc = "Next buffer" })
vim.keymap.set("n", "<C-Tab>", ":bprev<CR>", { desc = "Previous buffer" })

-- U for redo
vim.keymap.set("n", "U", "<C-r>")

-- Quick find/replace word under cursor
vim.keymap.set("n", "S", function()
	local cmd = ":%s/<C-r><C-w>/<C-r><C-w>/gI<Left><Left><Left>"
	local keys = vim.api.nvim_replace_termcodes(cmd, true, false, true)
	vim.api.nvim_feedkeys(keys, "n", false)
end, { desc = "Find/replace word under cursor" })

-- Swap to last buffer
vim.keymap.set("n", "<leader>'", "<C-^>", { desc = "Switch to last buffer" })

-- Visual indent and stay selected
vim.keymap.set("x", "<<", function()
	vim.cmd("normal! <<")
	vim.cmd("normal! gv")
end)
vim.keymap.set("x", ">>", function()
	vim.cmd("normal! >>")
	vim.cmd("normal! gv")
end)

-- Paste without overwriting register
vim.keymap.set("x", "<leader>p", '"_dP')

-- Move lines in visual mode
vim.keymap.set("v", "<A-j>", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "<A-k>", ":m '<-2<CR>gv=gv")

-- Open link under cursor (requires utils.prelude)
vim.keymap.set("n", "gx", function()
	require("utils.prelude").open_link()
end, { desc = "Open link under cursor" })

-- Twoslash keymaps
vim.keymap.set("n", "<leader>ti", ":TwoslashQueriesInspect<CR>", { desc = "Twoslash inspect" })
vim.keymap.set("n", "<leader>ts", function()
	local twoslash = require("twoslash-queries")
	if twoslash.config.is_enabled then
		vim.cmd("TwoslashQueriesDisable")
	else
		vim.cmd("TwoslashQueriesEnable")
	end
end, { desc = "Toggle Twoslash" })

-- Autosave on insert leave and text changed
vim.api.nvim_create_autocmd({ "InsertLeave", "TextChanged" }, {
	pattern = "*",
	callback = function()
		if vim.bo.modified and vim.bo.buftype == "" then
			vim.cmd("silent write")
		end
	end,
})
