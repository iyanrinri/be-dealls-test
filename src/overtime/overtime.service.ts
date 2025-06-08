import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Overtime } from './entities/overtime.entity';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { Attendance } from '../attendances/entities/attendance.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { loggerConfig } from '../config/logger.config';
import { Logger } from 'winston';
import * as winston from 'winston';

@Injectable()
export class OvertimeService {
  private logger: Logger;
  constructor(
    @InjectRepository(Overtime)
    private overtimeRepository: Repository<Overtime>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(AttendancePeriod)
    private attendancePeriodRepository: Repository<AttendancePeriod>,
    private auditLogService: AuditLogService,
  ) {
    this.logger = winston.createLogger(loggerConfig);
  }

  async submitOvertime(dto: CreateOvertimeDto, user: UserPayload) {
    const overtimeDate = new Date();
    if (user.role !== 'employee') {
      throw new ForbiddenException('Only employees can submit overtime');
    }

    const period = await this.attendancePeriodRepository.findOne({
      where: {
        startDate: LessThanOrEqual(overtimeDate),
        endDate: MoreThanOrEqual(overtimeDate),
      },
    });

    if (!period) {
      throw new BadRequestException(
        'Admin has not created an attendance period',
      );
    }
    if (period.status !== 'open') {
      throw new BadRequestException(
        'Attendance period is not open for overtime submission',
      );
    }

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
        attendancePeriodId: parseInt(period.id)
      },
    });

    if (!existingOvertime) {
      const overtime = this.overtimeRepository.create({
        userId: user.id,
        attendancePeriodId: parseInt(period.id),
        overtimeDate: overtimeDate,
        hours: dto.hours,
        createdBy: user.id,
      });
      const savedOvertime = await this.overtimeRepository.save(overtime);
      this.auditLogService.logAction(
        user,
        'create',
        'overtimes',
        savedOvertime.id.toString(),
        dto
      ).catch((err) => {
        this.logger.error(`[AUDIT_ERROR] Failed log audit: ${err.message}`);
      });
      return savedOvertime;
    }
    existingOvertime.hours = dto.hours;
    existingOvertime.updatedBy = user.id;
    const updatedOvertime = await this.overtimeRepository.save(existingOvertime);
    this.auditLogService.logAction(
      user,
      'update',
      'overtimes',
      updatedOvertime.id.toString(),
      { hours: dto.hours }
    ).catch((err) => {
      this.logger.error(`[AUDIT_ERROR] Failed log audit: ${err.message}`);
    });
    return updatedOvertime;
  }

  async listOvertime(
    user: UserPayload,
    attendancePeriodId?: string,
    locale: string = 'en-US',
  ): Promise<any[]> {
    let periodId = attendancePeriodId;
    if (!periodId) {
      // Get the current period by date
      const today = new Date();
      const period = await this.attendanceRepository.manager
        .getRepository('AttendancePeriod')
        .findOne({
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
    const overtimes = await this.overtimeRepository.find({
      where: {
        userId: user.id,
        attendancePeriodId: periodId ? parseInt(periodId) : undefined,
      },
      order: { overtimeDate: 'ASC' },
      relations: ['user'],
    });
    return overtimes.map((o: any) => ({
      ...o,
      user: o.user
        ? {
            id: o.user.id,
            username: o.user.username,
            role: o.user.role,
          }
        : undefined,
      overtimeDateFormatted: o.overtimeDate
        ? new Date(o.overtimeDate).toLocaleString(locale, {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : null,
    }));
  }
}
