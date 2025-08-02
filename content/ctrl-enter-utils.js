function enableSendingWithCtrlEnter() {
  document.addEventListener("keydown", handleCtrlEnter, { capture: true });
}

function disableSendingWithCtrlEnter() {
  document.removeEventListener("keydown", handleCtrlEnter, { capture: true });
}

function getHostname() {
  return window.location.hostname;
}

function applySiteSetting() {
  const hostname = getHostname();
  const url = window.location.href;

  chrome.storage.sync.get("siteSettings", (data) => {
    const settings = data.siteSettings || {};
    
    // Special handling for GitHub Spark
    let isEnabled;
    if (url.startsWith("https://github.com/spark")) {
      isEnabled = settings["github.com/spark"] ?? true;
    } else {
      isEnabled = settings[hostname] ?? true;
    }

    if (isEnabled) {
      enableSendingWithCtrlEnter();
    } else {
      disableSendingWithCtrlEnter();
    }
  });
}
