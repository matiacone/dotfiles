local M = {}

local function get_visual_selection()
	local s_start = vim.fn.getpos("'<")
	local s_end = vim.fn.getpos("'>")
	local n_lines = math.abs(s_end[2] - s_start[2]) + 1
	local lines = vim.api.nvim_buf_get_lines(0, s_start[2] - 1, s_end[2], false)
	lines[1] = string.sub(lines[1], s_start[3], -1)
	if n_lines == 1 then
		lines[n_lines] = string.sub(lines[n_lines], 1, s_end[3] - s_start[3] + 1)
	else
		lines[n_lines] = string.sub(lines[n_lines], 1, s_end[3])
	end
	return table.concat(lines, "\n")
end

local function extract_markdown_link()
	local line = vim.api.nvim_get_current_line()
	local col = vim.api.nvim_win_get_cursor(0)[2] + 1

	local pattern = "%[.-%]%((.-)%)"
	local start_pos = 1

	while true do
		local link_start, link_end, url = line:find(pattern, start_pos)
		if not link_start then
			break
		end
		if col >= link_start and col <= link_end then
			return url
		end
		start_pos = link_end + 1
	end

	return nil
end

function M.open_link()
	local url = nil

	if vim.fn.mode() == "v" or vim.fn.mode() == "V" then
		vim.cmd('normal! "vy')
		url = vim.fn.getreg("v")
	else
		url = extract_markdown_link()
		if not url then
			url = vim.fn.expand("<cfile>")
		end
	end

	if url and url ~= "" then
		if not url:match("^https?://") and not url:match("^file://") then
			if vim.fn.filereadable(url) == 1 then
				vim.cmd("edit " .. url)
				return
			end
		end

		vim.fn.jobstart({ "xdg-open", url }, { detach = true })
	end
end

function M.copy_line_diagnostics_to_clipboard()
	local ok, tiny_inline = pcall(require, "tiny-inline-diagnostic")
	if not ok then
		vim.notify("tiny-inline-diagnostic not installed", vim.log.levels.WARN)
		return
	end

	local diagnostics = tiny_inline.get_diagnostic_under_cursor(vim.diagnostic.get(0))
	if not diagnostics or #diagnostics == 0 then
		vim.notify("No diagnostics under cursor", vim.log.levels.INFO)
		return
	end

	local messages = {}
	for _, diag in ipairs(diagnostics) do
		table.insert(messages, diag.message)
	end

	local text = table.concat(messages, "\n")
	vim.fn.setreg("+", text)
	vim.notify("Copied diagnostics to clipboard", vim.log.levels.INFO)
end

return M
