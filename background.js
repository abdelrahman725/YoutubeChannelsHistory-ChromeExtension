// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (
//     changeInfo.status === "complete" &&
//     tab.url &&
//     tab.url.includes("youtube.com/watch")
//   ) {
//     console.log("tab changed ");
//         console.count("new youtube vidoe opened");
    
//         const queryParameters = tab.url.split("?")[1];
//         const urlParameters = new URLSearchParams(queryParameters);
    
//         chrome.tabs.sendMessage(tabId, {
//               videoId: urlParameters.get("v"),
//             });
//     }
// });
