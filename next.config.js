/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    // Handle import.meta and dynamic requires
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      }
    });

    // Ignore dynamic require warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@llamaindex\/env\/dist\/index\.js$/ },
      { module: /node_modules\/replicate\/lib\/util\.js$/ }
    ];
    
    return config;
  },
  transpilePackages: ['@huggingface/transformers', 'llamaindex', '@llamaindex/env', 'replicate'],
};

module.exports = nextConfig;
