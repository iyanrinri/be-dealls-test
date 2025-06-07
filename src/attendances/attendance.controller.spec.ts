import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';

jest.mock('@nestjs/jwt');
jest.mock('@nestjs/config');

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let attendanceService: AttendanceService;

  const mockAttendanceService = {
    createAttendancePeriod: jest.fn(),
    submitAttendance: jest.fn(),
    listAttendance: jest.fn(),
    listAttendancePeriods: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        JwtService,
        Reflector,
        ConfigService,
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AttendanceController>(AttendanceController);
    attendanceService = module.get<AttendanceService>(AttendanceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAttendancePeriod', () => {
    it('should create a new attandace period', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
      };

      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };

      const expectedResult = {
        id: 1,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      };

      mockAttendanceService.createAttendancePeriod.mockResolvedValue(expectedResult);

      // Panggil controller langsung dengan parameter user, bukan request object
      const result = await controller.createAttendancePeriod(user, dto);

      expect(mockAttendanceService.createAttendancePeriod).toHaveBeenCalledWith(
        dto,
        user,
      );
      expect(result).toEqual({ message: 'Attendance period created', data: expectedResult });
    });

    it('should return unauthorized message if no user in request', async () => {
      const dto: CreateAttendancePeriodDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
      };

      const error = new HttpException('Unauthorized', 401);
      mockAttendanceService.createAttendancePeriod = jest.fn().mockRejectedValue(error);
      await expect(controller.createAttendancePeriod(null, dto)).rejects.toThrow(HttpException);
    });
  });

  describe('submitAttendance', () => {
    it('should submit a new attendance', async () => {
      const user: UserPayload = {
        id: 2,
        username: 'employee',
        role: 'employee',
        ip_address: '127.0.0.2',
      };
      const expectedAttendance = {
        id: 10,
        userId: user.id,
        attendancePeriodId: 1,
        attendanceDate: new Date('2025-06-06'),
        clockInTime: new Date('2025-06-06T08:00:00.000Z'),
        clockOutTime: undefined,
        createdBy: user.id,
        updatedBy: user.id,
        ipAddress: user.ip_address,
      };
      mockAttendanceService.submitAttendance.mockResolvedValue(expectedAttendance);
      const result = await controller.submitAttendance(user);
      expect(mockAttendanceService.submitAttendance).toHaveBeenCalledWith(user);
      expect(result).toEqual({ message: 'Attendance submitted', data: expectedAttendance });
    });

    it('should return unauthorized message if no user in request', async () => {
      const error = new HttpException('Unauthorized', 401);
      mockAttendanceService.submitAttendance = jest.fn().mockRejectedValue(error);
      await expect(controller.submitAttendance(null)).rejects.toThrow(HttpException);
    });
  });

  describe('listAttendance', () => {
    it('should return attendance list for current user', async () => {
      const user: UserPayload = {
        id: 3,
        username: 'employee2',
        role: 'employee',
        ip_address: '127.0.0.3',
      };
      const attendancePeriodId = '5';
      const expectedList = [
        {
          id: 100,
          userId: user.id,
          attendancePeriodId: 5,
          attendanceDate: new Date('2025-06-07'),
          clockInTime: new Date('2025-06-07T08:00:00.000Z'),
          clockOutTime: new Date('2025-06-07T17:00:00.000Z'),
          createdBy: user.id,
          updatedBy: user.id,
          ipAddress: user.ip_address,
        },
      ];
      mockAttendanceService.listAttendance.mockResolvedValue(expectedList);
      const result = await controller.listAttendance(user, attendancePeriodId);
      expect(mockAttendanceService.listAttendance).toHaveBeenCalledWith(user, attendancePeriodId);
      expect(result).toEqual({ message: 'Attendance list', data: expectedList });
    });

    it('should return unauthorized message if no user in request', async () => {
      const error = new HttpException('Unauthorized', 401);
      mockAttendanceService.listAttendance = jest.fn().mockRejectedValue(error);
      await expect(controller.listAttendance(null, '5')).rejects.toThrow(HttpException);
    });
  });

  describe('listAttendancePeriods', () => {
    it('should return attendance period list for authorized user', async () => {
      const user: UserPayload = {
        id: 1,
        username: 'admin',
        role: 'admin',
        ip_address: '127.0.0.1',
      };
      const expectedPeriods = [
        {
          id: 1,
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-30'),
          status: 'open',
        },
        {
          id: 2,
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-31'),
          status: 'closed',
        },
      ];
      mockAttendanceService.listAttendancePeriods.mockResolvedValue(expectedPeriods);
      const result = await controller.listAttendancePeriods(user);
      expect(mockAttendanceService.listAttendancePeriods).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Attendance periods list', data: expectedPeriods });
    });

    it('should return unauthorized message if no user in request', async () => {
      mockAttendanceService.listAttendancePeriods.mockClear();
      const error = new HttpException('Unauthorized', 401);
      mockAttendanceService.listAttendancePeriods = jest.fn().mockRejectedValue(error);
      await expect(controller.listAttendancePeriods(null)).rejects.toThrow(HttpException);
    });
  });
});
