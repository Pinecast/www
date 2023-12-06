import {H2} from '@/components/Typography';
import type {MDXComponents} from 'mdx/types';
import Image from 'next/image';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({children}) => <H2 style={{fontSize: '100px'}}>{children}</H2>,
    ...components,
  };
}
