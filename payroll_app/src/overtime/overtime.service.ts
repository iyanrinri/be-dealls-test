import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Overtime } from './entities/overtime.entity';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { Attendance } from '../attendances/entities/attendance.entity';

@Injectable()
export class OvertimeService {
  constructor(
    @InjectRepository(Overtime)
    private overtimeRepository: Repository<Overtime>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async submitOvertime(dto: CreateOvertimeDto, user: UserPayload) {
    const overtimeDate = new Date();
    if (user.role !== 'employee') {
      throw new ForbiddenException('Only employees can submit overtime');
    }

    // Check if the employee has clocked out for the day
    const attendance = await this.attendanceRepository.findOne({
      where: {
        userId: user.id,
        attendanceDate: overtimeDate,
      },
    });
    const isWeekend = (date) => {
      const day = date.getDay();
      return day === 0 || day === 6;
    };

    if (!attendance || !attendance.clockOutTime) {
      if (!isWeekend(overtimeDate)) {
        throw new BadRequestException(
          'You must clock out before submitting overtime',
        );
      }
    }

    if (dto.hours > 3) {
      throw new BadRequestException(
        'Overtime cannot be more than 3 hours per day',
      );
    }

    const existingOvertime = await this.overtimeRepository.findOne({
      where: {
        userId: user.id,
        overtimeDate: overtimeDate,
        attendancePeriodId: attendance?.attendancePeriodId,
      },
    });

    if (!existingOvertime) {
      const overtime = this.overtimeRepository.create({
        userId: user.id,
        attendancePeriodId: attendance?.attendancePeriodId,
        overtimeDate: overtimeDate,
        hours: dto.hours,
        createdBy: user.id,
        ipAddress: user.ip_address,
      });
      return this.overtimeRepository.save(overtime);
    }
    existingOvertime.hours = dto.hours;
    existingOvertime.updatedBy = user.id;
    existingOvertime.ipAddress = user.ip_address;

    return this.overtimeRepository.save(existingOvertime);
  }
}
