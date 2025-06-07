import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reimbursement } from './entities/reimbursement.entity';
import { ReimbursementService } from './reimbursement.service';
import { ReimbursementController } from './reimbursement.controller';
import { AuthModule } from '../auth/auth.module';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reimbursement, AttendancePeriod]),
    AuthModule,
  ],
  controllers: [ReimbursementController],
  providers: [ReimbursementService],
})
export class ReimbursementModule {}
