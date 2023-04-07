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

  constructor() {
    this.eventEmitter.on(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, () => {
      this.currentNotification = undefined;
    });
  }

  async createNotificationWindow(
    notification: NotificationInfo,
    options?: CreateNotificationOptions,
  ): Promise<{ messenger: SessionMessenger<SessionMethods>; window: Windows.Window }> {
    if (
      options?.preventDuplicate &&
      (isEqual(notification, this.currentNotification) || this.hasTheSameInQueue(notification))
    ) {
      throw NexusCommonErrors.DuplicateRequest();
    }
    const _this = this;

    async function _createNotificationWindow(): Promise<{
      messenger: SessionMessenger<SessionMethods>;
      window: Windows.Window;
    }> {
      // chrome popup window
      const messenger = createSessionMessenger<SessionMethods>({
        adapter: browserExtensionAdapter,
        sessionId: notification.sessionId,
      });
      const lastFocused = await browser.windows.getLastFocused();
      const windowSize = NotificationWindowSizeMap[notification.path];
      const window = await browser.windows.create({
        type: 'popup',
        focused: true,
        top: lastFocused.top,
        left: lastFocused.left! + (lastFocused.width! - 360),
        width: windowSize.w,
        height: windowSize.h + 28,
        url: `notification.html#/${notification.path}?sessionId=${notification.sessionId}`,
      });

      browser.windows.onRemoved.addListener(() => {
        _this.eventEmitter.emit(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, { sessionId: messenger.sessionId() });
      });

      return { window, messenger };
    }

    this.eventEmitter.on(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, ({ sessionId }) => {
      if (this.notificationInfoQueue[0].sessionId === sessionId) {
        this.currentNotification = undefined;
      }
    });

    if (!this.currentNotification) {
      this.currentNotification = notification;
      return _createNotificationWindow();
    } else {
      this.notificationInfoQueue.push(notification);
      return new Promise((resolve) => {
        this.eventEmitter.on(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, ({ sessionId }) => {
          if (this.notificationInfoQueue[0].sessionId !== sessionId) return;
          resolve(_createNotificationWindow());
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
