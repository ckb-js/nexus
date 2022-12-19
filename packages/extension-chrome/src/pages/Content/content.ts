import { sendMessage } from 'webext-bridge';

function injectScript(): void {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('inpage.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

window.addEventListener('message', (event) => {
  if (event.data.target === 'NEXUS_INPAGE') {
    sendMessage('notification', {}, 'background');
  }
});

if (document.doctype?.name === 'html') {
  injectScript();
}
