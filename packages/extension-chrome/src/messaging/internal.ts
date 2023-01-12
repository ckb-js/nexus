import { nanoid } from 'nanoid';
import { errors } from '@nexus-wallet/utils';

export type Context = 'content-script' | 'website';
const NEXUS_MESSAGE_TYPE_KEY = '__NEXUS_MESSAGE_TYPE__' as const;

interface NexusMessage<T> {
  /**
   * Identifier symbol of NexusMessage, if an object has this key,
   * then it will be identified as a NexusMessage
   */
  [NEXUS_MESSAGE_TYPE_KEY]: string;

  id: string;
  target: Context;
  sender: Context;
  data: T;
}

export type GetCurrentContext = typeof getCurrentContext;

/* istanbul ignore next */
/**
 * check a script context is content script or in a website
 */
export function getCurrentContext(): Context {
  if (typeof chrome !== 'undefined' && typeof chrome.extension !== 'undefined') return 'content-script';
  if (typeof document !== 'undefined' && document.location.href.startsWith('http')) return 'website';

  errors.throwError('Unknown runtime environment');
}

/**
 * {@link NexusMessage}
 * @param options
 */
export function createNexusMessage<T>(options: {
  data: T;
  type: string;
  sender: Context;
  target: Context;
  id?: string;
}): NexusMessage<T> {
  return {
    [NEXUS_MESSAGE_TYPE_KEY]: options.type,
    id: options.id ?? nanoid(),
    target: options.target,
    sender: options.sender,
    data: options.data,
  };
}

export function typeOfNexusMessage<T>(message: NexusMessage<T>): string {
  return message[NEXUS_MESSAGE_TYPE_KEY];
}

export function isNexusMessage<T>(obj: unknown): obj is NexusMessage<T> {
  if (typeof obj !== 'object') return false;
  if (obj == null) return false;
  return NEXUS_MESSAGE_TYPE_KEY in obj;
}
