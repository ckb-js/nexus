import { EventEmitter } from 'events';
import browser, { Windows } from 'webextension-polyfill';
import { createSessionMessenger, SessionMessenger } from '../../messaging/session';
import { browserExtensionAdapter } from '../../messaging/adapters';
import { NotificationPath, SessionMethods } from './common';
import isEqual from 'lodash.isequal';
import omit from 'lodash/omit';
import { NexusCommonErrors } from '../../errors';
import { nanoid } from 'nanoid';

const NotificationWindowSizeMap: Record<NotificationPath, { w: number; h: number }> = {
  grant: {
    w: 500,
    h: 600,
  },
  'sign-data': {
    w: 500,
    h: 722,
  },
  'sign-transaction': {
    w: 500,
    h: 722,
  },
};

type NotificationInfo = {
  path: NotificationPath;
  sessionId: string;
  metadata: {
    chainId?: string;
    host?: string;
  };
};

type CreateNotificationOptions = {
  preventDuplicate?: boolean;
};

type NotificationInfoWithStatus = {
  notification: NotificationInfo;
  status: 'active' | 'closed';
};

type NotificationEventName = 'onPopupClosed';

type NotificationManagerEventEmitter = {
  on(event: NotificationEventName, listener: (payload: { sessionId: string }) => void): void;
  emit(event: NotificationEventName, payload: { sessionId: string }): void;
};

class NotificationManager {
  currentNotification: NotificationInfoWithStatus | undefined = undefined;
  notificationInfoQueue: NotificationInfo[] = [];
  eventEmitter: NotificationManagerEventEmitter = new EventEmitter();

  async createNotificationWindow(
    _notification: Omit<NotificationInfo, 'sessionId'>,
    options?: CreateNotificationOptions,
  ): Promise<{ messenger: SessionMessenger<SessionMethods>; window: Windows.Window }> {
    // assign sessionId to the notification
    const notification: NotificationInfo = { ..._notification, sessionId: nanoid() };
    // prevent duplicate notification
    if (
      options?.preventDuplicate &&
      (this.isCurrentNotification(notification) || this.hasTheSameInQueue(notification))
    ) {
      throw NexusCommonErrors.DuplicateRequest();
    }

    if (!this.isCurrentNotificationActive()) {
      return this._createNotificationWindow(notification);
    } else {
      this.notificationInfoQueue.push(notification);
      return new Promise((resolve) => {
        this.eventEmitter.on('onPopupClosed', ({ sessionId }) => {
          // only process when the notification is at the top of the queue
          if (
            !this.isAtTopOfQueue(notification) ||
            this.isCurrentNotificationActive() ||
            sessionId !== this.currentNotification?.notification.sessionId
          ) {
            return;
          }

          const nextNotification = this.notificationInfoQueue.shift()!;
          resolve(this._createNotificationWindow(nextNotification));
        });
      });
    }
  }

  async _createNotificationWindow(payload: NotificationInfo): Promise<{
    messenger: SessionMessenger<SessionMethods>;
    window: Windows.Window;
  }> {
    this.openCurrentNotification(payload);
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
        this.closeCurrentNotification();
        this.eventEmitter.emit('onPopupClosed', { sessionId: messenger.sessionId() });
      }
    });
    return { window, messenger };
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

export type { NotificationInfo, CreateNotificationOptions };
export { NotificationManager };
