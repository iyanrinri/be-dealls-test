/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendances/attendance.module';
import { AttendancePeriod } from './attendances/entities/attendance-period.entity';
import { Attendance } from './attendances/entities/attendance.entity';
import { AuditLogModule } from './audit-logs/audit-log.module';
import { OvertimeModule } from './overtime/overtime.module';
import * as dotenv from 'dotenv';
import { Overtime } from './overtime/entities/overtime.entity';
import { Reimbursement } from './reimbursements/entities/reimbursement.entity';
import { ReimbursementModule } from './reimbursements/reimbursement.module';
import { PayrollModule } from './payroll/payroll.module';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'dealls',
      password: process.env.DB_PASSWORD || 'd3alls',
      database: process.env.DB_DATABASE || 'be_dealls',
      entities: [User, AuditLog, AttendancePeriod, Attendance, Overtime, Reimbursement],
      synchronize: false,
    }),
    AuthModule,
    AttendanceModule,
    AuditLogModule,
    OvertimeModule,
    ReimbursementModule,
    PayrollModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
