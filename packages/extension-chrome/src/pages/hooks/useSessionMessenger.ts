import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSessionMessenger, SessionMessenger } from '../../messaging/session';
import { SessionMethods } from '../../services/notification';
import { browserExtensionAdapter } from '../../messaging/adapters';

/**
 * create a SessionMessenger instance for communication with background
 * @param sessionId
 */
export function useSessionMessenger(sessionId?: string): SessionMessenger<SessionMethods> {
  const [searchParams] = useSearchParams();
  sessionId = sessionId || searchParams.get('sessionId')!;

  return useMemo(() => createSessionMessenger({ adapter: browserExtensionAdapter, sessionId }), [sessionId]);
}
