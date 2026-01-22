return {
	"folke/snacks.nvim",
	opts = {
		scroll = { enabled = false },
		bigfile = { enabled = true },
		bufdelete = { enabled = true },
		dim = { enabled = true },
		gitbrowse = { enabled = true },
		scratch = { enabled = true },
		notifier = { enabled = true, timeout = 3000 },
		terminal = {
			win = {
				height = 0.25,
			},
		},
		picker = {
			sources = {
				files = {
					hidden = true,
				},
			},
		},
	},
	keys = {
		{
			"<leader>bd",
			function()
				Snacks.bufdelete()
			end,
			desc = "Buffer Delete",
		},
		{
			"<leader>og",
			function()
				Snacks.gitbrowse()
			end,
			desc = "Open in Git",
			mode = { "n", "v" },
		},
		{
			"<leader>.",
			function()
				Snacks.scratch()
			end,
			desc = "Scratch Buffer",
		},
		{
			"<leader>td",
			function()
				Snacks.toggle.diagnostics():toggle()
			end,
			desc = "Toggle Diagnostics",
		},
		{
			"<leader>zm",
			function()
				Snacks.toggle.dim():toggle()
			end,
			desc = "Toggle Dim Mode",
		},
		{
			"<leader>ih",
			function()
				Snacks.toggle({
					name = "Inlay Hints",
					get = function()
						return vim.lsp.inlay_hint.is_enabled()
					end,
					set = function(state)
						vim.lsp.inlay_hint.enable(state)
					end,
				}):toggle()
			end,
			desc = "Toggle Inlay Hints",
		},
	},
}
