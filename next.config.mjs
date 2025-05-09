/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['sstmwvnstzwaopqjkurm.supabase.co'],
    unoptimized: true,
  },
}

export default nextConfig
