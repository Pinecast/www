import * as React from 'react';

export function useStorage<T>(
  key: string,
  initialValue?: T,
  channelName?: string,
) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        if (channelName && typeof BroadcastChannel !== 'undefined') {
          const broadcastChannel = new BroadcastChannel(channelName);
          broadcastChannel.postMessage(valueToStore);
          broadcastChannel.close();
        }
      }
    } catch {}
  };

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const broadcastChannel =
      channelName && typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(channelName)
        : null;

    const handleMessage = (event: MessageEvent) => setStoredValue(event.data);
    broadcastChannel?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      broadcastChannel?.removeEventListener('message', handleMessage);
      broadcastChannel?.close();
    };
  }, [key, channelName]);

  return [storedValue, setValue] as const;
}

export default useStorage;
