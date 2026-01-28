/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        domains: [],
    },
    env: {
        NEXT_PUBLIC_USE_MOCK_DATA: 'true',
    },
}

module.exports = nextConfig
