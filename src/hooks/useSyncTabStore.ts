import * as React from 'react';

const supportsBroadcastChannel = () =>
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined';

// Subscribe to messages from background tabs so the
// current tab can react to changed values.
export const useSyncTabStore = <T>(
  key: string,
  initialValue: T,
  onChannelMessage?: (message: T) => void,
) => {
  const [localState, setLocalState] = React.useState<T>(initialValue);
  const channelRef = React.useRef<BroadcastChannel | null>(null);

  React.useEffect(() => {
    const channel = supportsBroadcastChannel()
      ? new BroadcastChannel(key)
      : null;
    channelRef.current = channel;
    const channelMessageHandler = (event: MessageEvent) => {
      onChannelMessage?.(event.data);
    };
    channel?.addEventListener('message', channelMessageHandler);
    return () => {
      channel?.removeEventListener('message', channelMessageHandler);
      channel?.close();
    };
  }, [key, onChannelMessage]);

  // Wrap useState's setter to notify background tabs when this tab's value changes.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Values can be functions, following useState's API.
      const newValue = value instanceof Function ? value(localState) : value;

      setLocalState(newValue);

      if (supportsBroadcastChannel()) {
        // Notify background tabs of the changed value.
        const channel = channelRef.current ?? new BroadcastChannel(key);
        channel.postMessage(newValue);
        channel.close();
      }
    } catch {}
  };

  return [localState, setValue] as const;
};
