import { NetworkName } from './ConfigService';

/**
 * emit event to injected CKB provider
 */
export interface EventService {
  emit<E extends keyof NexusEventMap>(payload: EmitPayload<E, NexusEventMap[E]>): void;

  // uncomment me if we need to support dynamic event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // emit(payload: EmitPayload<string, any>): void;
}

export interface NexusEventMap {
  networkChanged: NetworkName;
}

interface EmitPayload<K, O> {
  eventKey: K;
  value: O;
}
