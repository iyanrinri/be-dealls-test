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
import * as dotenv from 'dotenv';
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
      entities: [User, AuditLog, AttendancePeriod, Attendance],
      synchronize: false,
    }),
    AuthModule,
    AttendanceModule,
    AuditLogModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
