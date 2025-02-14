chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    console.log("Active Tab:", tab.url);
    sendTabDataToApp(tab.url);
});

// Send active tab data to your web app
function sendTabDataToApp(url) {
    fetch("http://localhost:3000/api/track-tabs", { // Replace with your API URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, timestamp: new Date().toISOString() })
    });
}
