// It's called "background" file and will be run first.

// // Browser request we want to tracking
// const filter = {
//     urls: ["*://price-api.vndirect.com.vn/stocks/snapshot*"],
//     types: ["xmlhttprequest"]
// };
//
// /**
//  * Invoke when browser receive an response from request which match with filter above
//  * @param details
//  */
// let callback = function(details) {
//     // Send a message to "content script" to inform that request is success or not
//     if (details.statusCode.toString() === '200') {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(details.tabId, {status: true});  // chrome.tabs dispatch message to "content script"
//         });
//     } else {
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(details.tabId, {status: false});
//         });
//     }
// }
//
// // Listen browser request
// chrome.webRequest.onCompleted.addListener(callback, filter);

let cafefCompaniesInfo = "";

/**
 * Get companies information from Cafef. It's Javascript file thus Return data is "string" look like Javascript code.
 * Idea is run that "string" as Javascript code using eval() function but we can't run at "background page"
 * We will set it to a variable and then send to "content script" which needs to use.
 */
let getCafefCompaniesInfo = function() {
    axios.get("http://cafef3.mediacdn.vn/v2/kby/ccf4d584-4b06-4370-acff-c0241b4ad0d6/kby.js").then(function (result) {
        try {
            if (result.status === 200) {
                cafefCompaniesInfo = result.data;
            } else {
                cafefCompaniesInfo = "";
            }
        } catch (e) {
            console.log('Background File --- Call API from Cafef error:', e);
            cafefCompaniesInfo = "";
        }
    })
}
getCafefCompaniesInfo(); // Get companies information from "Cafef" at the first time Extension is install or update.

/**
 * Emit an action each 15 days
 * For update Companies information from Cafef
 */
chrome.alarms.create("getCafefCompaniesInfo", {
    periodInMinutes: 15 * 24 * 60 // The alarm will fire again every "periodInMinutes"
});

/**
 * Listen all event which "alarms" emit. (chrome.alarms.create)
 */
chrome.alarms.onAlarm.addListener(function( alarm ) {
    if (alarm.name === "getCafefCompaniesInfo") {
        getCafefCompaniesInfo();
    }
});

/**
 * Listen all event "chrome.runtime.sendMessage"
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.PREPARE_START) {
        sendResponse({cafefCompaniesInfo})
    }
});