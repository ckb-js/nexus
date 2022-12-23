import browser from 'webextension-polyfill';

// FIXME: https://developer.chrome.com/docs/extensions/reference/action/#method-getPopup
// declare module 'chrome' {
//   namespace chrome.action {
//     function openPopup(options?: unknown, callback?: () => void): void;
//   }
// }
import { onMessage } from 'webext-bridge';

import { Router, Model, Types } from 'chomex';

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
// Define your model
class User extends Model {
  static schema = {
    name: Types.string.isRequired,
    age: Types.number,
  };
}
const router = new Router();
// Define your routes
router.on('/users/create', (message) => {
  console.log('====================================');
  console.log('user create, message is:', message);
  console.log('====================================');
  const obj = message.user;
  const user = User.new(obj).save();
  return user;
});

chrome.runtime.onMessage.addListener(router.listener());
