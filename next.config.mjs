/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
          bodySizeLimit: '10mb', // Increase to desired size (e.g., 10mb, 20mb)
        },
      },
      images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'eahapzcfddwvxsqtksba.supabase.co',
            port: '',
            pathname: '/storage/v1/object/public/**',
          },
        ],
      },
};

export default nextConfig;
