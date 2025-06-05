import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'myuser',
  password: process.env.DB_PASSWORD || 'mypassword',
  database: process.env.DB_DATABASE || 'mydb',

  entities: [User],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'custom_migration_table',

  synchronize: false,
  logging: true,
});

export default AppDataSource;
