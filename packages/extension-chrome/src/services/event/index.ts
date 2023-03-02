import { NetworkName } from '@nexus-wallet/types/lib/services';
import { EventEmitter } from 'events';

export interface EventMap {
  /**
   * available for all pages
   * @param networkName
   */
  networkChanged: (networkName: NetworkName) => void;
  /**
   * available only for extension
   */
  walletInitialized: () => void;
}

export interface EventHub {
  on<K extends keyof EventMap>(event: K, callback: EventMap[K]): void;
  emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>): void;
  removeListener<K extends keyof EventMap>(event: K, listener: EventMap[K]): void;

  // uncomment me if we want to support wildcard event
  // emit(event: string, ...args: unknown[]): void;
  // on(event: string, callback: EventListener): void;
  // export type EventListener = (...args: unknown[]) => void;
}

export function createEventHub(): EventHub {
  const emitter = new EventEmitter();

  return {
    on: emitter.on.bind(emitter),
    emit: emitter.emit.bind(emitter),
    removeListener: emitter.removeListener.bind(emitter),
  };
}
