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

export type NotificationInfoWithStatus = {
  notification: NotificationInfo;
  status: 'active' | 'closed';
};

type CreateNotificationOptions = {
  preventDuplicate?: boolean;
};

export class NotificationManager {
  currentNotification: NotificationInfoWithStatus | undefined = undefined;
  notificationInfoQueue: NotificationInfo[] = [];
  eventEmitter: EventEmitter = new EventEmitter();

  async createNotificationWindow(
    notification: NotificationInfo,
    options?: CreateNotificationOptions,
  ): Promise<{ messenger: SessionMessenger<SessionMethods>; window: Windows.Window }> {
    const _this = this;
    if (
      options?.preventDuplicate &&
      (this.isCurrentNotification(notification) || this.hasTheSameInQueue(notification))
    ) {
      throw NexusCommonErrors.DuplicateRequest();
    }

    async function _createNotificationWindow(payload: NotificationInfo): Promise<{
      messenger: SessionMessenger<SessionMethods>;
      window: Windows.Window;
    }> {
      _this.openCurrentNotification(payload);
      // chrome popup window
      const messenger = createSessionMessenger<SessionMethods>({
        adapter: browserExtensionAdapter,
        sessionId: payload.sessionId,
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
          _this.closeCurrentNotification();
          _this.eventEmitter.emit(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, { sessionId: messenger.sessionId() });
        }
      });
      return { window, messenger };
    }

    if (!this.isCurrentNotificationActive()) {
      return _createNotificationWindow(notification);
    } else {
      this.notificationInfoQueue.push(notification);
      return new Promise((resolve) => {
        this.eventEmitter.on(NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED, ({ sessionId }) => {
          // only process when the notification is at the top of the queue
          if (
            !this.isAtTopOfQueue(notification) ||
            this.isCurrentNotificationActive() ||
            sessionId !== this.currentNotification?.notification.sessionId
          )
            return;
          const nextNotification = this.notificationInfoQueue.shift()!;
          resolve(_createNotificationWindow(nextNotification));
        });
      });
    }
  }

  isAtTopOfQueue(notification: NotificationInfo): boolean {
    return this.notificationInfoQueue[0]?.sessionId === notification.sessionId;
  }

  openCurrentNotification(notification: NotificationInfo): void {
    this.currentNotification = { notification, status: 'active' };
  }

  closeCurrentNotification(): void {
    if (this.currentNotification?.status === 'active') {
      this.currentNotification = { notification: this.currentNotification!.notification, status: 'closed' };
    }
  }

  isCurrentNotificationActive(): boolean {
    return this.currentNotification?.status === 'active';
  }

  isCurrentNotification(notification: NotificationInfo): boolean {
    return (
      this.currentNotification?.status === 'active' &&
      isEqual(omit(notification, 'sessionId'), omit(this.currentNotification?.notification, 'sessionId'))
    );
  }

  hasTheSameInQueue(notification: NotificationInfo): boolean {
    return !!this.notificationInfoQueue.find((info) => {
      return isEqual(omit(notification, 'sessionId'), omit(info, 'sessionId'));
    });
  }
}
