import {useStyletron} from 'styletron-react';

export const useCSS = () => {
  return useStyletron()[0];
};
