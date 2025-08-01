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
  return false;
}

function findSendButton() {
  const submitButton = document.querySelector('query-box form button[type="submit"]');
  if (submitButton) return submitButton;
  return null;
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
    const preventDefaultSites = ["https://claude.ai", "https://www.phind.com"];
    if (preventDefaultSites.some((site) => url.startsWith(site))) {
      event.preventDefault();
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

// Listen for changes to the site settings and apply them dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.siteSettings) {
    applySiteSetting();
  }
});
