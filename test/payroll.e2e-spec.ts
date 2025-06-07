import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PayrollModule } from '../src/payroll/payroll.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payslip } from '../src/payroll/entities/payslip.entity';
import { AttendancePeriod } from '../src/attendances/entities/attendance-period.entity';
import { Attendance } from '../src/attendances/entities/attendance.entity';
import { Overtime } from '../src/overtime/entities/overtime.entity';
import { Reimbursement } from '../src/reimbursements/entities/reimbursement.entity';
import { User } from '../src/users/entities/user.entity';

describe('PayrollController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Payslip, AttendancePeriod, Attendance, Overtime, Reimbursement, User],
          synchronize: true,
        }),
        PayrollModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/payroll/run (POST) should fail if period not found', async () => {
    return request(app.getHttpServer())
      .post('/payroll/run')
      .send({ attendancePeriodId: 999 })
      .expect(404);
  });

  // Add more integration tests for success and edge cases
});
