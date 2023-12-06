const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: function (config) {
    config.externals = config.externals || {};
    config.externals['styletron-server'] = 'styletron-server';
    return config;
  },
  reactStrictMode: true,
  pageExtensions: ['tsx', 'mdx'],
};

module.exports = withMDX(nextConfig);
