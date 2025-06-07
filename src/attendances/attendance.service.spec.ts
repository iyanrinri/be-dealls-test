import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendancePeriod } from './entities/attendance-period.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { AuditLogService } from '../audit-logs/audit-log.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendancePeriodRepository: Repository<AttendancePeriod>;
  let attendanceRepository: Repository<Attendance>;

  const mockAttendancePeriodRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAttendanceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(AttendancePeriod),
          useValue: mockAttendancePeriodRepository,
        },
        {
          provide: getRepositoryToken(Attendance),
          useValue: mockAttendanceRepository,
        },
        {
          provide: AuditLogService,
          useValue: { createAuditLog: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    attendancePeriodRepository = module.get<Repository<AttendancePeriod>>(
      getRepositoryToken(AttendancePeriod),
    );
    attendanceRepository = module.get<Repository<Attendance>>(
      getRepositoryToken(Attendance),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttendancePeriod', () => {
    it('should create a new attendance period successfully', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'open',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };

      const newPeriod = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      };

      mockAttendancePeriodRepository.create.mockReturnValue(newPeriod);
      mockAttendancePeriodRepository.save.mockResolvedValue(newPeriod);

      const result = await service.createAttendancePeriod(dto, user);

      expect(mockAttendancePeriodRepository.create).toHaveBeenCalledWith({
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      });
      expect(mockAttendancePeriodRepository.save).toHaveBeenCalledWith(newPeriod);
      expect(result).toEqual(newPeriod);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-30',
        endDate: '2025-06-01',
        status: 'open',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };

      await expect(service.createAttendancePeriod(dto, user)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockAttendancePeriodRepository.create).not.toHaveBeenCalled();
      expect(mockAttendancePeriodRepository.save).not.toHaveBeenCalled();
    });

    it('should create a attendance period with default values if not provided', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
      };

      const newPeriod = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: undefined,
        createdBy: user.id,
        ipAddress: undefined,
        updatedBy: user.id,
      };

      mockAttendancePeriodRepository.create.mockReturnValue(newPeriod);
      mockAttendancePeriodRepository.save.mockResolvedValue(newPeriod);

      const result = await service.createAttendancePeriod(dto, user);

      expect(mockAttendancePeriodRepository.create).toHaveBeenCalledWith({
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: undefined,
        createdBy: user.id,
        ipAddress: undefined,
        updatedBy: user.id,
      });
      expect(mockAttendancePeriodRepository.save).toHaveBeenCalledWith(newPeriod);
      expect(result).toEqual(newPeriod);
    });
  });

  describe('submitAttendance', () => {
    const user: UserPayload = {
      id: 2,
      username: 'employee',
      role: 'employee',
      ip_address: '127.0.0.2',
    };
    const period = {
      id: '1',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-30'),
      status: 'open',
    };
    const today = new Date();
    const attendance = {
      id: 10,
      userId: user.id,
      attendancePeriodId: parseInt(period.id),
      attendanceDate: today,
      clockInTime: today,
      clockOutTime: undefined,
      createdBy: user.id,
      ipAddress: user.ip_address,
      updatedBy: user.id,
    };

    it('should submit a new attendance successfully', async () => {
      mockAttendancePeriodRepository.findOne.mockResolvedValue(period);
      mockAttendanceRepository.findOne.mockResolvedValue(undefined);
      mockAttendanceRepository.create.mockReturnValue(attendance);
      mockAttendanceRepository.save.mockResolvedValue(attendance);
      // Set today to a weekday (Monday)
      const monday = new Date('2025-06-09'); // 2025-06-09 is a Monday
      jest.spyOn(global, 'Date').mockImplementation(() => monday as any);
      const result = await service.submitAttendance(user);
      expect(mockAttendancePeriodRepository.findOne).toHaveBeenCalled();
      expect(mockAttendanceRepository.findOne).toHaveBeenCalled();
      expect(mockAttendanceRepository.create).toHaveBeenCalledWith({
        userId: user.id,
        attendancePeriodId: parseInt(period.id),
        attendanceDate: monday,
        clockInTime: monday,
        clockOutTime: undefined,
        createdBy: user.id,
        ipAddress: user.ip_address,
        updatedBy: user.id,
      });
      expect(mockAttendanceRepository.save).toHaveBeenCalledWith(attendance);
      expect(result).toEqual(attendance);
      (global.Date as any).mockRestore();
    });

    it('should throw BadRequestException if attendance period does not exist', async () => {
      mockAttendancePeriodRepository.findOne.mockResolvedValue(undefined);
      await expect(service.submitAttendance(user)).rejects.toThrow(BadRequestException);
      expect(mockAttendanceRepository.create).not.toHaveBeenCalled();
      expect(mockAttendanceRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if attendance date is outside attendance period', async () => {
      const periodOut = { ...period, startDate: new Date('2025-06-01'), endDate: new Date('2025-06-05') };
      mockAttendancePeriodRepository.findOne.mockResolvedValue(periodOut);
      await expect(service.submitAttendance(user)).rejects.toThrow(BadRequestException);
      expect(mockAttendanceRepository.create).not.toHaveBeenCalled();
      expect(mockAttendanceRepository.save).not.toHaveBeenCalled();
    });

    it('should return existing attendance if already submitted for the same day', async () => {
      const weekDay = new Date();
      const dayOfWeek = weekDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      if (dayOfWeek === 0) {
        // Sunday: go back 2 days to Friday
        weekDay.setDate(weekDay.getDate() - 2);
      } else if (dayOfWeek === 6) {
        // Saturday: go back 1 day to Friday
        weekDay.setDate(weekDay.getDate() - 1);
      }
      const submittedAttendance = {
        ...attendance,
        clockInTime: weekDay,
        clockOutTime: weekDay,
      };
      mockAttendancePeriodRepository.findOne.mockResolvedValue(period);
      mockAttendanceRepository.findOne.mockResolvedValue(submittedAttendance);
      const result = await service.submitAttendance(user, weekDay);
      expect(mockAttendanceRepository.create).not.toHaveBeenCalled();
      expect(mockAttendanceRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual(submittedAttendance);
    });

    it('should throw BadRequestException if trying to submit attendance on weekend', async () => {
      mockAttendancePeriodRepository.findOne.mockResolvedValue(period);
      mockAttendanceRepository.findOne.mockResolvedValue(undefined);
      // Set today to a Saturday
      const saturday = new Date('2025-06-07'); // 2025-06-07 is a Saturday
      jest.spyOn(global, 'Date').mockImplementation(() => saturday as any);
      await expect(service.submitAttendance(user)).rejects.toThrow('Cannot submit attendance on weekends');
      (global.Date as any).mockRestore();
    });
  });
});
