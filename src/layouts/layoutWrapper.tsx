export const layoutWrapper = <T extends Record<string, any>>(
  Layout: React.FC<T & {children: React.ReactNode}>,
  props: T,
) =>
  function wrappedLayout({children}: {children: React.ReactNode}) {
    return <Layout {...props}>{children}</Layout>;
  };
