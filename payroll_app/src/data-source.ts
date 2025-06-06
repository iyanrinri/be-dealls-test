import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'dealls',
  password: process.env.DB_PASSWORD || 'd3alls',
  database: process.env.DB_DATABASE || 'be_dealls',

  entities: [User],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',

  synchronize: false,
  logging: true,
});

export default AppDataSource;
