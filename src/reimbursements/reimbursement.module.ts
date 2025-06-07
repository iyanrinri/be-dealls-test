import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';
import { AuthModule } from '../auth/auth.module';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogModule } from '../audit-logs/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reimbursement, AttendancePeriod]),
    AuthModule,
    JwtModule.register({}),
    AuditLogModule,
  ],
  controllers: [ReimbursementController],
  providers: [ReimbursementService],
})
export class ReimbursementModule {}
