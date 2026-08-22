/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Applies to every route. These are safe, non-breaking baseline
        // protections — none of them change existing behavior for a
        // normal request.
        source: '/:path*',
        headers: [
          // Prevents the admin login page (or any page) from being
          // framed by another site for clickjacking.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stops the browser from MIME-sniffing responses away from
          // their declared Content-Type.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Sends the full referrer only to same-origin requests, an
          // origin-only referrer cross-origin, and nothing on downgrade.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
