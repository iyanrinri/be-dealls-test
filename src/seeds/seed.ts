import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import * as bcrypt from 'bcrypt';
import { instanceToPlain } from 'class-transformer';
import * as dotenv from 'dotenv';
dotenv.config();


async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'dealls',
    password: process.env.DB_PASSWORD || 'd3alls',
    database: process.env.DB_DATABASE || 'be_dealls',
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
    employee.salary = (Math.floor(Math.random() * 50) + 50) * 100000;
    employee.created_by = admin.id;
    await dataSource.manager.save(employee);

    const auditLog = new AuditLog();
    auditLog.userId = admin.id;
    auditLog.recordId = employee.id.toString();
    auditLog.tableName = 'users';
    auditLog.action = 'create';
    auditLog.changes = instanceToPlain(employee);
    auditLog.requestId = `employee${i}`;
    auditLog.ipAddress = '127.0.0.1';
    await dataSource.manager.save(auditLog);
  }
  console.log('Seeding database completed.');
  await dataSource.destroy();
}

seed();
