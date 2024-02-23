import * as React from 'react';

export function useStorage<T>(
  key: string,
  initialValue?: T,
  onChannelMessage?: (message: T) => void,
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

  // Expose this wrapper around useState's setter that also
  // persists to localStorage and notifies background tabs.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Values can be functions, following useState's API.
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Notify background tabs of the changed value.
        if (typeof BroadcastChannel !== 'undefined') {
          const broadcastChannel = new BroadcastChannel(key);
          broadcastChannel.postMessage(valueToStore);
          broadcastChannel.close();
        }
      }
    } catch {}
  };

  // Listen for messages from background tabs so the
  // current tab can react to changed values.
  React.useEffect(() => {
    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(key)
        : null;
    const channelMessageHandler = (event: MessageEvent) => {
      onChannelMessage?.(event.data);
    };
    channel?.addEventListener('message', channelMessageHandler);
    return () => {
      channel?.removeEventListener('message', channelMessageHandler);
      channel?.close();
    };
  }, [key, initialValue, onChannelMessage]);

  return [storedValue, setValue] as const;
}
