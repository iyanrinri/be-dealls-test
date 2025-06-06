import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AuditLog } from './audit-logs/audit-log.entity';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendances/attendance.module';
import { PayrollPeriod } from './attendances/entities/payroll-period.entity';
import { Attendance } from './attendances/entities/attendance.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'dealls',
      password: process.env.DB_PASSWORD || 'd3alls',
      database: process.env.DB_DATABASE || 'be_dealls',
      entities: [User, AuditLog, PayrollPeriod, Attendance],
      synchronize: false,
    }),
    AuthModule,
    AttendanceModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
