import {isBot} from 'next/dist/server/web/spec-extension/user-agent';
import * as React from 'react';

const Context = React.createContext<string>('');
export const Provider = Context.Provider;

export const useIsBot = () => {
  const userAgent = React.useContext(Context);
  return isBot(userAgent);
};
