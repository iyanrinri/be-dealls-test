/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancePeriod } from './entities/attendance-period.entity';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { CreateAuditLogDto } from '../audit-logs/dto/create-audit-log.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(AttendancePeriod)
    private attendancePeriodRepository: Repository<AttendancePeriod>,
    private auditLogService: AuditLogService,
  ) {}

  async createAttendancePeriod(
    dto: CreateAttendancePeriodDto,
    user: UserPayload,
  ): Promise<AttendancePeriod> {
    const { startDate, endDate, status } = dto;

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
      if (status) {
        existingPeriod.status = status || 'open';
      }
      existingPeriod.updatedBy = user.id;
      const auditLogDto: CreateAuditLogDto = {
        userId: user.id,
        requestId: user.request_id || undefined,
        action: 'update',
        tableName: 'attendance_periods',
        recordId: existingPeriod.id.toString(),
        ipAddress: user.ip_address || undefined,
        changes: {
          status: status,
          updatedBy: user.id,
        },
      };
      this.auditLogService.createAuditLog(auditLogDto, user);
      return this.attendancePeriodRepository.save(existingPeriod);
    }
    const period = this.attendancePeriodRepository.create({
      startDate: startDate,
      endDate: endDate,
      status: status,
      createdBy: user.id,
      ipAddress: user.ip_address || undefined,
      updatedBy: user.id,
    });

    const savedPeriod = await this.attendancePeriodRepository.save(period);
    const auditLogDto: CreateAuditLogDto = {
      userId: user.id,
      requestId: user.request_id || undefined,
      action: 'create',
      tableName: 'attendance_periods',
      recordId: savedPeriod.id.toString(),
      ipAddress: user.ip_address || undefined,
      changes: {
        startDate: startDate,
        endDate: endDate,
        status: status,
        createdBy: user.id,
        ipAddress: user.ip_address || undefined,
        updatedBy: user.id,
      },
    };
    this.auditLogService.createAuditLog(auditLogDto, user);
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
        const auditLogDto: CreateAuditLogDto = {
          userId: user.id,
          requestId: user.request_id || undefined,
          action: 'update',
          tableName: 'attendances',
          recordId: existingAttendance.id.toString(),
          ipAddress: user.ip_address || undefined,
          changes: {
            clockOutTime: attendanceDate,
          },
        };
        this.auditLogService.createAuditLog(auditLogDto, user);
        return await this.attendanceRepository.save(existingAttendance);
      }
      return existingAttendance;
    }

    const attendance = this.attendanceRepository.create({
      userId: user.id,
      attendancePeriodId: parseInt(period.id || '0'),
      attendanceDate: attendanceDate,
      clockInTime: new Date(),
      clockOutTime: undefined,
      createdBy: user.id,
      ipAddress: user.ip_address || undefined,
      updatedBy: user.id,
    });
    const savedAttendance = await this.attendanceRepository.save(attendance);
    const auditLogDto: CreateAuditLogDto = {
      userId: user.id,
      requestId: user.request_id || undefined,
      action: 'create',
      tableName: 'attendances',
      recordId: savedAttendance.id.toString(),
      ipAddress: user.ip_address || undefined,
      changes: {
        attendanceDate: attendanceDate,
        clockInTime: new Date(),
      },
    };
    this.auditLogService.createAuditLog(auditLogDto, user);
    return savedAttendance;
  }

  async listAttendance(user: UserPayload, attendancePeriodId?: string): Promise<Attendance[]> {
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
    return this.attendanceRepository.find({
      where: {
        userId: user.id,
        attendancePeriodId: parseInt(periodId),
      },
      order: { attendanceDate: 'ASC' },
    });
  }

  async listAttendancePeriods(): Promise<AttendancePeriod[]> {
    return this.attendancePeriodRepository.find({
      order: { startDate: 'DESC' },
    });
  }
}
