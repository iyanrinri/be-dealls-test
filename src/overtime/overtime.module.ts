import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Overtime } from './entities/overtime.entity';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { Attendance } from '../attendances/entities/attendance.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Overtime, Attendance, AttendancePeriod]),
    AuthModule,
    JwtModule.register({}),
    AuditLogModule,
  ],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
