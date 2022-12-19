import browser from 'webextension-polyfill';

// FIXME: https://developer.chrome.com/docs/extensions/reference/action/#method-getPopup
// declare module 'chrome' {
//   namespace chrome.action {
//     function openPopup(options?: unknown, callback?: () => void): void;
//   }
// }
import { onMessage } from 'webext-bridge';

onMessage('notification', async () => {
  browser.windows.create({
    type: 'popup',
    focused: true,
    left: 200,
    width: 360,
    height: 600,
    url: 'popup.html',
  });
});
