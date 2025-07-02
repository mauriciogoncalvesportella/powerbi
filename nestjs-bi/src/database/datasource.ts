// src/database/datasource.ts
import { ConnectionOptions, createConnection } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente do arquivo .env
config();

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'bi',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: true,
};

export default connectionOptions;