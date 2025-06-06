import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { PayrollPeriod } from './entities/payroll-period.entity';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(PayrollPeriod)
    private payrollPeriodRepository: Repository<PayrollPeriod>,
  ) {}

  async createPayrollPeriod(
    dto: CreatePayrollPeriodDto,
    user: UserPayload,
  ): Promise<PayrollPeriod> {
    const { startDate, endDate, status } = dto;

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }
    const period = this.payrollPeriodRepository.create({
      startDate: startDate,
      endDate: endDate,
      status: status,
      createdBy: user.id,
      ipAddress: user.ip_address || undefined,
      updatedBy: user.id,
    });

    return this.payrollPeriodRepository.save(period);
  }

  // async submitAttendance(
  //   userId: string,
  //   dto: CreateAttendanceDto,
  // ): Promise<Attendance> {
  //   const { payrollPeriodId, date } = dto;
  //   const attendanceDate = new Date(date);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   attendanceDate.setHours(0, 0, 0, 0);
  //
  //   // Check if the payroll period exists and is valid
  //   const period = await this.payrollPeriodRepository.findOne({
  //     where: { id: payrollPeriodId },
  //   });
  //
  //   if (!period) {
  //     throw new BadRequestException('Invalid payroll period');
  //   }
  //
  //   if (attendanceDate < period.startDate || attendanceDate > period.endDate) {
  //     throw new BadRequestException('Attendance date outside payroll period');
  //   }
  //
  //   // Check for existing attendance on the same day
  //   const existingAttendance = await this.attendanceRepository.findOne({
  //     where: {
  //       userId,
  //       payrollPeriodId,
  //       date: attendanceDate,
  //     },
  //   });
  //
  //   if (existingAttendance) {
  //     return existingAttendance; // Return existing if already submitted today
  //   }
  //
  //   const attendance = this.attendanceRepository.create({
  //     userId,
  //     payrollPeriodId,
  //     date: attendanceDate,
  //   });
  //
  //   return this.attendanceRepository.save(attendance);
  // }
}
