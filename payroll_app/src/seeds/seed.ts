import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'myuser',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_DATABASE || 'mydb',
    entities: [User],
  });

  await dataSource.initialize();

  for (let i = 1; i <= 100; i++) {
    const employee = new User();
    employee.username = `employee${i}`;
    employee.password = await bcrypt.hash('password123', 10);
    employee.role = 'employee';
    employee.salary = Math.floor(Math.random() * 5000000) + 5000000;
    await dataSource.manager.save(employee);
  }

  // for admin user
  const admin = new User();
  admin.username = 'admin';
  admin.password = await bcrypt.hash('admin123', 10);
  admin.role = 'admin';
  admin.salary = 0;
  await dataSource.manager.save(admin);

  console.log('Seeding database completed.');
  await dataSource.destroy();
}

seed();
