/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancePeriod } from './entities/attendance-period.entity';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { loggerConfig } from '../config/logger.config';
import { Logger } from 'winston';
import * as winston from 'winston';

@Injectable()
export class AttendanceService {
  private logger: Logger;
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(AttendancePeriod)
    private attendancePeriodRepository: Repository<AttendancePeriod>,
    private auditLogService: AuditLogService,
  ) {
    this.logger = winston.createLogger(loggerConfig);
  }

  async createAttendancePeriod(
    dto: CreateAttendancePeriodDto,
    user: UserPayload,
  ): Promise<AttendancePeriod> {
    const { startDate, endDate } = dto;

    if (new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('End date must be after start date');
    }
    const existingPeriod = await this.attendancePeriodRepository.findOne({
      where: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    if (existingPeriod) {
      throw new BadRequestException('Attendance period already exists');
    }
    const data = {
      startDate: startDate,
      endDate: endDate,
      status: 'open',
      createdBy: user.id,
      updatedBy: user.id,
    }
    const period = this.attendancePeriodRepository.create(data);

    const savedPeriod = await this.attendancePeriodRepository.save(period);
    this.auditLogService.logAction(
      user,
      'create',
      'attendance_periods',
      savedPeriod.id.toString(),
      data
    ).catch((err) => {
      this.logger.error(`[AUDIT_ERROR] Failed log audit: ${err.message}`);
    });
    return period;
  }

  async submitAttendance(user: UserPayload, initDate?: Date): Promise<Attendance> {
    let attendanceDate = initDate ? new Date(initDate) : new Date();
    if (initDate && isNaN(attendanceDate.getTime())) {
      throw new BadRequestException('Invalid initDate provided');
    }
    const period = await this.attendancePeriodRepository.findOne({
      where: {
        startDate: LessThanOrEqual(attendanceDate),
        endDate: MoreThanOrEqual(attendanceDate),
      },
    });

    if (!period) {
      throw new BadRequestException(
        'Admin has not created an attendance period',
      );
    }

    if (attendanceDate < period.startDate || attendanceDate > period.endDate) {
      throw new BadRequestException(
        'Attendance date outside attendance period',
      );
    }

    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        userId: user.id,
        attendancePeriodId: parseInt(period.id),
        attendanceDate: attendanceDate,
      },
    });

    const day = attendanceDate.getDay();
    if (day === 0 || day === 6) {
      throw new BadRequestException('Cannot submit attendance on weekends');
    }

    if (existingAttendance) {
      if (existingAttendance.clockInTime && existingAttendance.clockOutTime) {
        return existingAttendance;
      }
      let updated = false;
      if (!existingAttendance.clockInTime) {
        existingAttendance.clockInTime = attendanceDate;
        updated = true;
      } else if (!existingAttendance.clockOutTime) {
        existingAttendance.clockOutTime = attendanceDate;
        updated = true;
      }
      if (updated) {
        this.auditLogService.logAction(
          user,
          'update',
          'attendances',
          existingAttendance.id.toString(),
          { clockOutTime: attendanceDate }
        ).catch((err) => {
          this.logger.error(`[AUDIT_ERROR] Failed log audit: ${err.message}`);
        });
        return await this.attendanceRepository.save(existingAttendance);
      }
      return existingAttendance;
    }

    const data = {
      userId: user.id,
      attendancePeriodId: parseInt(period.id || '0'),
      attendanceDate: attendanceDate,
      clockInTime: new Date(),
      clockOutTime: undefined,
      createdBy: user.id,
      updatedBy: user.id,
    };
    const attendance = this.attendanceRepository.create(data);
    const savedAttendance = await this.attendanceRepository.save(attendance);
    this.auditLogService.logAction(
      user,
      'create',
      'attendances',
      savedAttendance.id.toString(),
      data
    ).catch((err) => {
      this.logger.error(`[AUDIT_ERROR] Failed log audit: ${err.message}`);
    });
    return savedAttendance;
  }

  async listAttendance(user: UserPayload, attendancePeriodId?: string): Promise<any[]> {
    let periodId = attendancePeriodId;
    if (!periodId) {
      // Get current period by date
      const today = new Date();
      const period = await this.attendancePeriodRepository.findOne({
        where: {
          startDate: LessThanOrEqual(today),
          endDate: MoreThanOrEqual(today),
        },
      });
      if (!period) {
        throw new BadRequestException('No attendance period found for today');
      }
      periodId = period.id;
    }
    const attendances = await this.attendanceRepository.find({
      where: {
        userId: user.id,
        attendancePeriodId: parseInt(periodId),
      },
      order: { attendanceDate: 'ASC' },
      relations: ['attendancePeriod', 'user'],
    });
    return attendances.map((a: any) => ({
      ...a,
      clockInTimeFormatted: a.clockInTime
        ? new Date(a.clockInTime).toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
      clockOutTimeFormatted: a.clockOutTime
        ? new Date(a.clockOutTime).toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
      attendancePeriod: a.attendancePeriod || undefined,
      user: a.user
        ? {
            id: a.user.id,
            username: a.user.username,
            role: a.user.role,
          }
        : undefined,
    }));
  }

  async listAttendancePeriods(): Promise<AttendancePeriod[]> {
    return this.attendancePeriodRepository.find({
      order: { startDate: 'DESC' },
    });
  }
}
