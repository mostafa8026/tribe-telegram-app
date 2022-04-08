import { registerAs } from '@nestjs/config';

export default registerAs('ormConfig', () => ({
  type: process.env.TYPEORM_CONNECTION || 'mssql',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: +process.env.TYPEORM_PORT || 1433,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE || false,
  extra: process.env.TYPEORM_DRIVER_EXTRA,
}));
