/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: function (config) {
    config.externals = config.externals || {};
    config.externals['styletron-server'] = 'styletron-server';
    return config;
  },
  reactStrictMode: true,
};

module.exports = nextConfig
