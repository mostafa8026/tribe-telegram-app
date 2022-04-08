import { registerAs } from '@nestjs/config';

export default registerAs('botConfig', () => ({
  token: process.env.TELEGRAM_BOT_TOKEN,
  userName: process.env.TELEGRAM_BOT_USERNAME,
}));
