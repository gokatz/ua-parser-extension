import { browser } from '../utils/common';

const rootId = '___ua_parser_root';
let root = document.createElement('div');
root.id = rootId;
document.body.appendChild(root);

document.addEventListener('mouseup', (event) => {

  /**
      Analyzing the selected text after the next browser tick. 
      Becoz clearing the selected value may take sometime for the browser
  */
  setTimeout(() => {
    let selectedText = (document.getSelection().toString() || '').trim(); 
    
    browser.extension.sendMessage({
      type: 'parse_ua',
      text: selectedText
    }, (response) => {
      showUI(event, response);
    });
  }, 0);
});

function showUI(event, result) {
  
  let { pageY, pageX, target: { classList = [] } = {} } = event;

  let isPopperElement = classList.contains('ua-popper-details') ||
  classList.contains('ua-popper') ||
  classList.contains('ua-popper-root');

  if (isPopperElement) {
    return;
  }

  let {
    browser: {
      name = '',
      version
    } = {},
    os: {
      name: OSName = '',
      version: OSVersion = ''
    } = {}
  } = result || {};

  let browserDetails = name || version ? `<span class="ua-popper-details"> ${name} ${version && `v${version}`} </span>` : '';
  let osDetails = OSName || OSVersion ? `<span class="ua-popper-details"> ${OSName} ${OSVersion && `v${OSVersion}`} </span>`: '';

  if (!browserDetails && !osDetails) {
    clearUI();
    return;
  }

  let markup = `
  <div
    class="ua-popper-root"
    style="
      top: ${pageY}px;
      left: ${pageX}px;
    " 
  >
    <span class="ua-popper">
      ${browserDetails} ${browserDetails && osDetails && '&nbsp; &bull; &nbsp;'} ${osDetails}
    </span>
  <div>
  `;

  document.getElementById(rootId) ? document.getElementById(rootId).innerHTML = markup : '';
}

function clearUI() {
  document.getElementById(rootId) ? document.getElementById(rootId).innerHTML = '' : '';
}