import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        domains: ['liveblocks.io', 'lh3.googleusercontent.com'],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    /* config options here */
};

export default nextConfig;
