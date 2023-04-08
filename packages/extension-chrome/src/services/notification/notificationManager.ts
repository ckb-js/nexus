import { EventEmitter } from 'events';
import browser, { Windows } from 'webextension-polyfill';
import { createSessionMessenger, SessionMessenger } from '../../messaging/session';
import { browserExtensionAdapter } from '../../messaging/adapters';
import { NotificationPath, SessionMethods, NotificationWindowSizeMap } from './common';
import isEqual from 'lodash.isequal';
import omit from 'lodash/omit';
import { NexusCommonErrors } from '../../errors';

export const NOTIFICATION_MANAGER_EVENTS = {
  POPUP_CLOSED: 'onPopupClosed',
};

export type NotificationInfo = {
  path: NotificationPath;
  sessionId: string;
  metaData: {
    chainId?: string;
    host?: string;
  };
};

type CreateNotificationOptions = {
  preventDuplicate?: boolean;
};

export class NotificationManager {
  currentNotification: NotificationInfo | undefined = undefined;
  notificationInfoQueue: NotificationInfo[] = [];
  eventEmitter: EventEmitter = new EventEmitter();

  async createNotificationWindow(
    notification: NotificationInfo,
    options?: CreateNotificationOptions,
  ): Promise<{ messenger: SessionMessenger<SessionMethods>; window: Windows.Window }> {
    const _this = this;
    if (
      options?.preventDuplicate &&
      (isEqual(omit(notification, 'sessionId'), omit(this.currentNotification, 'sessionId')) ||
        this.hasTheSameInQueue(notification))
    ) {
      throw NexusCommonErrors.DuplicateRequest();
    }

    async function _createNotificationWindow(payload: NotificationInfo): Promise<{
      messenger: SessionMessenger<SessionMethods>;
      window: Windows.Window;
    }> {
      // chrome popup window
      const messenger = createSessionMessenger<SessionMethods>({
        adapter: browserExtensionAdapter,
        sessionId: notification.sessionId,
      });
      const lastFocused = await browser.windows.getLastFocused();
      const windowSize = NotificationWindowSizeMap[payload.path];
      const window = await browser.windows.create({
        type: 'popup',
        focused: true,
        top: lastFocused.top,
        left: lastFocused.left! + (lastFocused.width! - 360),
        width: windowSize.w,
        height: windowSize.h + 28,
        url: `notification.html#/${payload.path}?sessionId=${payload.sessionId}`,
      });

      browser.windows.onRemoved.addListener((windowId) => {
        if (windowId === window.id) {
          _this.currentNotification = undefined;
          _this.eventEmitter.emit(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, { sessionId: messenger.sessionId() });
        }
      });
      return { window, messenger };
    }

    if (!this.currentNotification) {
      this.currentNotification = notification;
      return _createNotificationWindow(notification);
    } else {
      this.notificationInfoQueue.push(notification);
      return new Promise((resolve) => {
        this.eventEmitter.on(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, () => {
          if (this.notificationInfoQueue[0]?.sessionId !== notification.sessionId) return;
          const nextNotification = this.notificationInfoQueue.shift()!;
          this.currentNotification = nextNotification;
          resolve(_createNotificationWindow(nextNotification));
        });
      });
    }
  }

  hasTheSameInQueue(notification: NotificationInfo): boolean {
    return !!this.notificationInfoQueue.find((info) => {
      return isEqual(omit(notification, 'sessionId'), omit(info, 'sessionId'));
    });
  }
}
