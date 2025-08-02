# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This Chrome extension does not use npm/yarn. Instead, use these Python tools:

```bash
# Create release ZIP file
python tools/make_release_zip.py

# Check consistency between manifest.json, constants/supported-sites.js, and README files
python tools/check_supported_sites.py
```

## Architecture Overview

This is a Chrome extension that enables Ctrl+Enter keyboard shortcut for AI chat services.

### Key Components

1. **Content Scripts Architecture**
   - `content/ctrl-enter-chatgpt.js`: ChatGPT-specific handling for `#prompt-textarea`
   - `content/ctrl-enter-textarea.js`: Generic textarea elements
   - `content/ctrl-enter-custom-inputs.js`: ContentEditable divs and custom input elements

2. **Site Detection Pattern**
   Each site has unique DOM structures requiring specific handling:
   ```javascript
   // Claude.ai: contentEditable div
   event.target.tagName === "DIV" && event.target.contentEditable === "true"
   
   // GitHub Copilot: placeholder attribute
   event.target.getAttribute("placeholder") === "Ask Copilot"
   
   // GitHub Spark: complex React-based inputs
   (event.target.tagName === "TEXTAREA" && event.target.classList.contains("FormControl-input"))
   ```

3. **Storage Management**
   - Uses Chrome Storage Sync API for per-site toggle settings
   - Settings accessible via popup and options page

4. **Special Case: GitHub Spark**
   GitHub Spark requires special handling due to its React-based architecture:
   - Uses dedicated event handlers (`handleGitHubSparkKeydown/Keypress/Keyup`)
   - Captures all keyboard events (keydown/keypress/keyup) in capture phase
   - Uses `document.execCommand('insertText')` for React compatibility
   - Fallback to manual text insertion if execCommand fails
   - Completely separated from main `handleCtrlEnter` function

5. **Adding New Sites**
   To add support for a new site:
   1. Add entry to `constants/supported-sites.js`
   2. Update `manifest.json` content_scripts
   3. Add site name to all README files (_locales translations)
   4. Add detection logic to appropriate content script
   5. For React-based sites, consider GitHub Spark approach
   6. Run `python tools/check_supported_sites.py` to verify consistency

### Testing

No formal test framework is used. Quality is ensured through:
- GitHub Actions CI that runs `check_supported_sites.py` on every push
- Manual testing on supported sites
- Consistency checks between configuration files

### Security Considerations

- Always check `event.isTrusted` before processing keyboard events
- Content scripts are isolated per site to minimize cross-site risks
- Use capture phase event listeners for better control over event propagation

### Troubleshooting React-based Sites

For sites that use React or similar frameworks:
1. Standard DOM manipulation may not work reliably
2. Use `document.execCommand('insertText')` when possible
3. Consider multiple event listeners (keydown/keypress/keyup)
4. Test thoroughly as React's synthetic event system can be unpredictable