function shouldHandleCtrlEnter(url, event) {
  if (url.startsWith("https://claude.ai")) {
    return event.target.tagName === "DIV" && event.target.contentEditable === "true";
  }
  else if (url.startsWith("https://notebooklm.google.com")) {
    return event.target.tagName === "TEXTAREA" && event.target.classList.contains("query-box-input");
  }
  else if (url.startsWith("https://gemini.google.com")) {
    return event.target.tagName === "DIV" &&
           event.target.classList.contains("ql-editor") &&
           event.target.contentEditable === "true";
  }
  else if (url.startsWith("https://www.phind.com")) {
    return event.target.tagName === "DIV" &&
           event.target.classList.contains("public-DraftEditor-content") &&
           event.target.contentEditable === "true";
  }
  else if (url.startsWith("https://chat.deepseek.com")) {
    return event.target.id === "chat-input";
  }
  else if (url.startsWith("https://grok.com")) {
    return event.target.tagName === "TEXTAREA";
  }
  else if (url.startsWith("https://github.com")) {
    return event.target.getAttribute("placeholder") === "Ask Copilot";
  }
  else if (url.startsWith("https://m365.cloud.microsoft/chat")) {
    return event.target.id === "m365-chat-editor-target-element";
  }
  else if (url.startsWith("https://aistudio.google.com")) {
    return event.target.tagName === "TEXTAREA" || 
           (event.target.tagName === "DIV" && event.target.contentEditable === "true");
  }
  else if (url.startsWith("https://github.com/spark")) {
    // Check if the input element is disabled or in working state
    if (event.target.disabled ||
        (event.target.placeholder && event.target.placeholder.includes("working"))) {
      return false;
    }
    
    // Check for GitHub Spark input elements - more comprehensive detection
    return (event.target.tagName === "TEXTAREA" && 
            (event.target.id === "iterate-modal-input" ||
             event.target.classList.contains("FormControl-input") ||
             event.target.classList.contains("form-control"))) ||
           (event.target.getAttribute("placeholder") && 
            (event.target.getAttribute("placeholder").includes("Ask") ||
             event.target.getAttribute("placeholder").includes("What") ||
             event.target.getAttribute("placeholder").includes("Describe") ||
             event.target.getAttribute("placeholder").includes("Type"))) ||
           (event.target.tagName === "DIV" && event.target.contentEditable === "true");
  }
  return false;
}

function findSendButton() {
  const submitButton = document.querySelector('query-box form button[type="submit"]');
  if (submitButton) return submitButton;
  return null;
}

// GitHub Spark specific handlers to completely override Enter key behavior
function handleGitHubSparkKeydown(event) {
  if (event.key === "Enter" && !(event.ctrlKey || event.metaKey || event.shiftKey)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Insert newline directly
    const textarea = event.target;
    if (textarea && (textarea.tagName === "TEXTAREA" || textarea.contentEditable === "true")) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Try execCommand first
      textarea.focus();
      if (!document.execCommand('insertText', false, '\n')) {
        // Fallback to manual insertion
        const value = textarea.value || textarea.textContent || "";
        const newValue = value.substring(0, start) + '\n' + value.substring(end);
        
        if (textarea.tagName === "TEXTAREA") {
          textarea.value = newValue;
        } else {
          textarea.textContent = newValue;
        }
        
        // Set cursor position
        if (textarea.setSelectionRange) {
          textarea.setSelectionRange(start + 1, start + 1);
        }
        
        // Trigger React events
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    return false;
  }
}

function handleGitHubSparkKeyPress(event) {
  if (event.key === "Enter" && !(event.ctrlKey || event.metaKey || event.shiftKey)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}

function handleGitHubSparkKeyup(event) {
  if (event.key === "Enter" && !(event.ctrlKey || event.metaKey || event.shiftKey)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}

function handleCtrlEnter(event) {
  const url = window.location.href;

  if (!shouldHandleCtrlEnter(url, event) || !event.isTrusted) {
    return;
  }

  const isOnlyEnter = (event.code === "Enter") && !(event.ctrlKey || event.metaKey);
  const isCtrlEnter = (event.code === "Enter") && (event.ctrlKey || event.metaKey);

  if (isOnlyEnter || isCtrlEnter) {
    // Prevent default behavior only for certain sites
    const preventDefaultSites = ["https://claude.ai", "https://www.phind.com", "https://github.com/spark"];
    if (preventDefaultSites.some((site) => url.startsWith(site))) {
      event.preventDefault();
    }
    
    // For GitHub Spark, special handling is already done by dedicated event listeners
    if (url.startsWith("https://github.com/spark")) {
      // Only handle Ctrl+Enter for sending messages
      if (isCtrlEnter) {
        // Allow normal Ctrl+Enter processing for message sending
        // Don't prevent default, let the normal flow handle it
      } else if (isOnlyEnter) {
        // Enter key handling is completely overridden by separate event listeners
        // Just prevent any further processing here
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    }
    
    event.stopImmediatePropagation();

    let eventConfig = {
      key: "Enter",
      code: "Enter",
      bubbles: true,
      cancelable: true,
      shiftKey: isOnlyEnter
    };

    // Phind requires keyCode to be set explicitly
    if (url.startsWith("https://www.phind.com")) {
      eventConfig.keyCode = 13;
    }

    // M365 Chat requires keyCode=13 for Ctrl+Enter to send message
    if (url.startsWith("https://m365.cloud.microsoft/chat") && isCtrlEnter) {
      eventConfig.keyCode = 13;
    }

    // GitHub Spark requires keyCode=13 for proper event handling
    if (url.startsWith("https://github.com/spark")) {
      eventConfig.keyCode = 13;
    }

    const newEvent = new KeyboardEvent("keydown", eventConfig);
    event.target.dispatchEvent(newEvent);
  }

  // NotebookLM requires clicking the send button instead of dispatching Enter
  if (isCtrlEnter && url.startsWith("https://notebooklm.google.com")) {
    const sendButton = findSendButton();
    if (sendButton) {
      sendButton.click();
    }
  }
}


// Apply the setting based on the current site on initial load
applySiteSetting();

// Special handling for GitHub Spark to prevent form submission on Enter
if (window.location.href.startsWith("https://github.com/spark")) {
  // Add multiple event listeners to completely override Enter key behavior
  document.addEventListener("keydown", handleGitHubSparkKeydown, { capture: true });
  document.addEventListener("keypress", handleGitHubSparkKeyPress, { capture: true });
  document.addEventListener("keyup", handleGitHubSparkKeyup, { capture: true });
}

// Listen for changes to the site settings and apply them dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});
