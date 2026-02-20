import 'dotenv/config';
import type { NextConfig } from 'next';
const isProd = process.env.APP_ENV === 'production';


const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: '/medsyncpro' ,
  assetPrefix: '/medsyncpro/',
};

export default nextConfig;
