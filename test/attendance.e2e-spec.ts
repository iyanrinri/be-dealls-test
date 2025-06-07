import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttendancePeriod } from '../src/attendances/entities/attendance-period.entity';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from '../src/auth/guards/admin.guard';

describe('AttendanceController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let attendancePeriodRepository: any;

  const mockAdminUser = {
    id: 1,
    username: 'admin',
    role: 'admin',
    ip_address: '127.0.0.1',
  };

  const mockAttendancePeriod = {
    id: '1',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-30'),
    status: 'open',
    createdBy: 1,
    updatedBy: 1,
    ipAddress: '127.0.0.1',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(AttendancePeriod))
      .useValue({
        create: jest.fn().mockReturnValue(mockAttendancePeriod),
        save: jest.fn().mockResolvedValue(mockAttendancePeriod),
      })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    attendancePeriodRepository = moduleFixture.get(getRepositoryToken(AttendancePeriod));
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/attendance/attendance-period (POST)', () => {
    it('should create a new attendance period', async () => {
      const token = jwtService.sign(mockAdminUser);
      
      const createDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'open',
      };

      const response = await request(app.getHttpServer())
        .post('/attendance/attendance-period')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(String),
        startDate: expect.any(String),
        endDate: expect.any(String),
        status: 'open',
      }));
      
      expect(attendancePeriodRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: createDto.startDate,
          endDate: createDto.endDate,
          status: createDto.status,
        }),
      );
      expect(attendancePeriodRepository.save).toHaveBeenCalled();
    });

    it('should return 400 for invalid date range', async () => {
      const token = jwtService.sign(mockAdminUser);
      
      const invalidDto = {
        startDate: '2025-06-30',
        endDate: '2025-06-01', // End date before start date
        status: 'open',
      };

      await request(app.getHttpServer())
        .post('/attendance/attendance-period')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 401 without authorization', async () => {
      const createDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'open',
      };

      await request(app.getHttpServer())
        .post('/attendance/attendance-period')
        .send(createDto)
        .expect(401);
    });
  });
});
