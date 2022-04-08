import { registerAs } from '@nestjs/config';

export default registerAs('proxyCofnig', () => ({
  enabled: process.env.PROXY_ENABLED || false,
  host: process.env.PROXY_HOST,
  port: process.env.PROXY_PORT,
  user: process.env.PROXY_USER,
  password: process.env.PROXY_PASS,
}));
