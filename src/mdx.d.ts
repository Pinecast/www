// The MDX files that pages import (content/): the component that @types/mdx
// declares, and the `frontmatter` of vendor/remark-frontmatter-export.mjs.
/// <reference types="mdx" />

declare module '*.mdx' {
  export const frontmatter: Record<string, unknown>;
}
