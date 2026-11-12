const path = require('path');

module.exports = async () => {
  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [
        (await import('remark-unwrap-images')).default,
        (await import('./vendor/remark-gfm-table.mjs')).default,
      ],
      rehypePlugins: [
        [
          (await import('./vendor/rehype-image-size.mjs')).default,
          {root: process.cwd() + '/public'},
        ],
        (await import('./vendor/rehype-heading-ids.mjs')).default,
        (await import('./vendor/rehype-table-row-headers.mjs')).default,
        [
          (await import('./vendor/rehype-heading-levels.mjs')).default,
          // <Step> renders a title with the look of a `#` heading.
          {components: {Step: 1}},
        ],
      ],
    },
  });

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'export',
    // Image Optimization API cannot be enabled for static builds.
    images: {unoptimized: true},
    webpack: function (config) {
      config.externals ??= {};
      config.externals['styletron-server'] = 'styletron-server';

      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      // The formatjs transform runs before SWC (`enforce: 'pre'`). See
      // vendor/formatjs-loader.js.
      config.module.rules.push({
        test: /\.tsx?$/,
        include: path.join(__dirname, 'src'),
        enforce: 'pre',
        use: [path.join(__dirname, 'vendor/formatjs-loader.js')],
      });
      // Every message reaches the bundle parsed (`ast` in
      // formatjs.options.js), so the parser is not needed in it.
      config.resolve.alias['@formatjs/icu-messageformat-parser$'] =
        require.resolve('@formatjs/icu-messageformat-parser/no-parser.js');

      return config;
    },
    reactStrictMode: false,
    pageExtensions: ['tsx', 'mdx'],
  };

  return withMDX(nextConfig);
};
