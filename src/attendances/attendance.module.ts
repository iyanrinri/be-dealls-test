import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { AttendancePeriod } from './entities/attendance-period.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditLogModule } from '../audit-logs/audit-log.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, AttendancePeriod]),
    AuthModule,
    AuditLogModule,
    JwtModule.register({}),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
