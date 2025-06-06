import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Overtime } from './entities/overtime.entity';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';
import { Attendance } from '../attendances/entities/attendance.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Overtime, Attendance]), AuthModule],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
