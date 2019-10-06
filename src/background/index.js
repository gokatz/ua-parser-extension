import { browser } from '../utils/common';

let parserInstance;

document.onload = () => {
  // create parser instance eagerly
  createParserInstance();
};

function createParserInstance() {
  if (parserInstance) {
    return parserInstance;
  }
  parserInstance =  new window.UAParser();
  return parserInstance;
}

// chrome.contextMenus.create({
//   title: 'Analyze this UA String',
//   contexts: ['selection'],
//   onclick: (options) => {
//     let { selectionText } = options;
//     selectionText = selectionText.trim();

//     let parserInstance = createParserInstance();
//     parserInstance.setUA(selectionText);
//     let result = parserInstance.getResult();

//     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//       let [ currentTab = {} ] = tabs || [];
//       chrome.tabs.sendMessage(currentTab.id, {action: "open_ua_details", result }, (response) => {});  
//     });
//   }
// }, () => {

// });

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  let { type, text } = request;

  if (type == 'parse_ua' && text) {
    let parserInstance = createParserInstance();
    parserInstance.setUA(text);
    let result = parserInstance.getResult();
    sendResponse(result);
  }
    
});