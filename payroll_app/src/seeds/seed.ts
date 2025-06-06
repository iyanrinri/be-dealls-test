import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { AuditLog } from '../audit-logs/audit-log.entity';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'myuser',
    password: process.env.DB_PASSWORD || 'mypassword',
    database: process.env.DB_DATABASE || 'mydb',
    entities: [User, AuditLog],
  });

  await dataSource.initialize();

  // for admin user
  const admin = new User();
  admin.username = 'admin';
  admin.password = await bcrypt.hash('admin123', 10);
  admin.role = 'admin';
  admin.salary = 0;
  await dataSource.manager.save(admin);

  for (let i = 1; i <= 100; i++) {
    const employee = new User();
    employee.username = `employee${i}`;
    employee.password = await bcrypt.hash('password' + i, 10);
    employee.role = 'employee';
    employee.salary = Math.floor(Math.random() * 5000000) + 5000000;
    employee.created_by = admin.id;
    employee.ip_address = '127.0.0.1';
    await dataSource.manager.save(employee);

    const auditLog = new AuditLog();
    auditLog.user_id = admin.id;
    auditLog.record_id = employee.id.toString();
    auditLog.table_name = 'users';
    auditLog.action = 'create';
    auditLog.changes = instanceToPlain(employee);
    auditLog.request_id = `employee${i}`;
    auditLog.ip_address = '127.0.0.1';
    await dataSource.manager.save(auditLog);
  }
  console.log('Seeding database completed.');
  await dataSource.destroy();
}

seed();
