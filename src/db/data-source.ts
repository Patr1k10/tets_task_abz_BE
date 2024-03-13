import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  synchronize: true,
  dropSchema: false,
  keepConnectionAlive: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'src/db/migrations',
    subscribersDir: 'subscriber',
  },
} as DataSourceOptions);

