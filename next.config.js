module.exports = async () => {
  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [(await import('remark-unwrap-images')).default],
      rehypePlugins: [
        [
          (await import('./vendor/rehype-image-size.mjs')).default,
          {root: process.cwd() + '/public'},
        ],
      ],
    },
  });

  const nextConfig = {
    webpack: function (config) {
      config.externals ??= {};
      config.externals['styletron-server'] = 'styletron-server';

      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      return config;
    },
    reactStrictMode: false,
    pageExtensions: ['tsx', 'mdx'],
  };

  return withMDX(nextConfig);
};
