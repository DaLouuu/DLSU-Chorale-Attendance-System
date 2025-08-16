/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript type checking during builds
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['sstmwvnstzwaopqjkurm.supabase.co'],
    unoptimized: true,
  },
}

export default nextConfig
