import browser, { Windows } from 'webextension-polyfill';
import { createSessionMessenger, SessionMessenger } from '../../messaging/session';
import { browserExtensionAdapter } from '../../messaging/adapters';
import { NotificationPath, SessionMethods } from './common';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';
import { NexusCommonErrors } from '../../errors';
import { nanoid } from 'nanoid';
import { EventEmitter } from 'eventemitter3';

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
    host?: string;
  };
};

type CreateNotificationOptions = {
  preventDuplicate?: boolean;
};

type NotificationEvents = {
  finish(payload: { nextSessionId: string | undefined }): void;
};

class NotificationManager {
  private currentNotification: NotificationInfo | undefined = undefined;
  private notificationInfoQueue: NotificationInfo[] = [];
  private eventEmitter = new EventEmitter<NotificationEvents>();

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
      this.addNotificationToQueue(notification);
      return new Promise((resolve) => {
        this.eventEmitter.on('finish', ({ nextSessionId }) => {
          // only process when the notification is at the top of the queue
          if (
            !this.isAtTopOfQueue(notification) ||
            this.isCurrentNotificationActive() ||
            nextSessionId !== notification.sessionId
          ) {
            return;
          }

          const nextNotification = this.notificationInfoQueue.shift()!;
          resolve(this._createNotificationWindow(nextNotification));
        });
      });
    }
  }

  private async _createNotificationWindow(payload: NotificationInfo): Promise<{
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
        this.eventEmitter.emit('finish', { nextSessionId: this.notificationInfoQueue[0]?.sessionId });
      }
    });
    return { window, messenger };
  }

  private getNotificationCount(): number {
    return this.currentNotification ? 1 + this.notificationInfoQueue.length : this.notificationInfoQueue.length;
  }

  /**
   * Updates the Web Extension's "badge" number, on the Nexus Logo in the toolbar.
   * The number reflects the current number of pending notifications needing user approval.
   */
  private async updateBadge(): Promise<void> {
    let label = '';
    const count = this.getNotificationCount();
    if (count) {
      label = String(count);
    }
    await browser.action.setBadgeText({ text: label });
    await browser.action.setBadgeBackgroundColor({ color: '#037DD6' });
  }

  private isAtTopOfQueue(notification: NotificationInfo): boolean {
    return this.notificationInfoQueue[0]?.sessionId === notification.sessionId;
  }

  private openCurrentNotification(notification: NotificationInfo): void {
    this.currentNotification = notification;
    void this.updateBadge();
  }

  private closeCurrentNotification(): void {
    this.currentNotification = undefined;
    void this.updateBadge();
  }

  private isCurrentNotificationActive(): boolean {
    return !!this.currentNotification;
  }

  private addNotificationToQueue(notification: NotificationInfo) {
    this.notificationInfoQueue.push(notification);
    void this.updateBadge();
  }

  private isCurrentNotification(notification: NotificationInfo): boolean {
    return (
      !!this.currentNotification &&
      isEqual(omit(notification, 'sessionId'), omit(this.currentNotification, 'sessionId'))
    );
  }

  private hasTheSameInQueue(notification: NotificationInfo): boolean {
    return !!this.notificationInfoQueue.find((info) => {
      return isEqual(omit(notification, 'sessionId'), omit(info, 'sessionId'));
    });
  }
}

export type { NotificationInfo, CreateNotificationOptions };
export { NotificationManager };
