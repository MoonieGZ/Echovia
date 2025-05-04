import type { NextConfig } from "next"

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingExcludes: {
    '*': [
      'old-version/**/*'
    ]
  }
} as NextConfig

export default nextConfig
