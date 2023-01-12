/** @type {WebSocket} */
let ws;
/** @type {number} */
let connectInterval;

function tryConnect() {
  connectInterval = setInterval(() => {
    try {
      if (!ws) {
        ws = new WebSocket(`ws://localhost:${process.env.BACKGROUND_RELOAD_PORT}`);
      }
      clearInterval(connectInterval);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
          console.log('Detect extension service worker change, reload extension');
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.reload) {
            chrome.runtime.reload();
          }
        }
      };
      ws.onclose = () => {
        ws = null;
        tryConnect();
      };
    } catch (e) {
      console.error('Can not connect extension hot reload server, retry in 3 seconds');
    }
  }, 3000);
}

tryConnect();
