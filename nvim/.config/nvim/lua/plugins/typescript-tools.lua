return {
	-- Disable LazyVim's default TS LSPs
	{ "neovim/nvim-lspconfig", opts = { servers = { vtsls = { enabled = false }, tsserver = { enabled = false } } } },

	-- Use typescript-tools instead
	{
		"pmizio/typescript-tools.nvim",
		dependencies = {
			"nvim-lua/plenary.nvim",
			"neovim/nvim-lspconfig",
			"marilari88/twoslash-queries.nvim",
		},
		ft = { "typescript", "typescriptreact", "javascript", "javascriptreact" },
		config = function()
			require("typescript-tools").setup({
				on_attach = function(client, bufnr)
					require("twoslash-queries").attach(client, bufnr)
				end,
				settings = {
					separate_diagnostic_server = true,
					publish_diagnostic_on = "insert_leave",
					jsx_close_tag = {
						enable = true,
						filetypes = { "javascriptreact", "typescriptreact" },
					},
					tsserver_file_preferences = {
						includeInlayParameterNameHints = "all",
						includeInlayVariableTypeHints = true,
						includeInlayPropertyDeclarationTypeHints = true,
						includeInlayFunctionParameterTypeHints = true,
						includeInlayFunctionLikeReturnTypeHints = true,
						includeCompletionsForModuleExports = true,
					},
					tsserver_max_memory = 12288,
				},
			})
		end,
	},
}
