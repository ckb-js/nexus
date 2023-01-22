import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

export const Enable: React.FC = () => {
  const [requesterUrl, setRequesterUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const res = await browser.runtime.sendMessage({ method: 'getRequesterAppInfo' });
      setRequesterUrl(res.url);
    })();
  }, []);

  if (!requesterUrl) return <h1>waiting...</h1>;

  return (
    <div className="container">
      <div>
        <h2>Allow {requesterUrl} to:</h2>
        see used locks, unused locks, activity and suggest transactions to approve
      </div>

      <button
        onClick={async () => {
          await browser.runtime.sendMessage({ method: 'userHasEnabledWallet' });
          window.close();
        }}
      >
        Approve
      </button>
    </div>
  );
};
