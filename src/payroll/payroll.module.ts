import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payslip } from './entities/payslip.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { Overtime } from '../overtime/entities/overtime.entity';
import { Reimbursement } from '../reimbursements/entities/reimbursement.entity';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payslip,
      AttendancePeriod,
      Attendance,
      Overtime,
      Reimbursement,
      User,
    ]),
    JwtModule.register({}),
    AuditLogModule,
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
