import { useEffect, useState } from 'react';
import { createServicesFactory } from '../../services';

export function useStartInitIfNotInitialized(): boolean {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const internalService = createServicesFactory().get('internalService');
    void internalService.isInitialized().then((initialized) => {
      if (initialized) {
        setInitialized(true);
        return;
      }

      return internalService.startInitIfNotInitialized();
    });
  }, []);

  return initialized;
}
