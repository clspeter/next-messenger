/** @type {import('next').NextConfig} */
const securityHeaders = [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-DNS-Prefetch-Control', value: 'on' },
    // HSTS only takes effect over HTTPS; harmless on http/localhost.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig = {
    experimental: {
        swcPlugins: [
            ["next-superjson-plugin", {}]
        ]
    },
    images: {
        domains: ['res.cloudinary.com',
            "avatars.githubusercontent.com",
            "lh3.googleusercontent.com",
        ],
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
}
module.exports = nextConfig
