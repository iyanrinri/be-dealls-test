import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Payslip } from './entities/payslip.entity';
import { AttendancePeriod } from '../attendances/entities/attendance-period.entity';
import { Overtime } from '../overtime/entities/overtime.entity';
import { Reimbursement } from '../reimbursements/entities/reimbursement.entity';
import { User } from '../users/entities/user.entity';
import { UserPayload } from '../auth/interfaces/user-payload.interface';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payslip)
    private payslipRepo: Repository<Payslip>,
    @InjectRepository(AttendancePeriod)
    private periodRepo: Repository<AttendancePeriod>,
    @InjectRepository(Overtime)
    private overtimeRepo: Repository<Overtime>,
    @InjectRepository(Reimbursement)
    private reimbursementRepo: Repository<Reimbursement>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async runPayroll(userPayload: UserPayload, attendancePeriodId?: string) {
    let period: AttendancePeriod | null;
    if (!attendancePeriodId) {
      const today = new Date();
      period = await this.periodRepo.findOne({
        where: {
          startDate: LessThanOrEqual(today),
          endDate: MoreThanOrEqual(today),
        },
      });
    } else {
      period = await this.periodRepo.findOne({ where: { id: attendancePeriodId } });
    }
    if (!period) throw new NotFoundException('Attendance period not found');
    if (period.status !== 'open') throw new BadRequestException('Payroll already processed for this period');
    
    const payslipCount = await this.payslipRepo.count({ where: { attendancePeriodId: Number(attendancePeriodId) } });
    if (payslipCount > 0) throw new BadRequestException('Payroll already processed for this period');

    const users = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('attendances', 'a', 'a.user_id = user.id AND a.attendance_period_id = :periodId', { periodId: attendancePeriodId })
      .where('user.role = :role', { role: 'employee' })
      .getMany();

    const payslips: Payslip[] = [];
    for (const user of users) {
      // Calculate base salary
      const baseSalary = user.salary ? Number(user.salary).toFixed(2) : '0.00';
      // Overtime
      const overtime = await this.overtimeRepo
        .createQueryBuilder('o')
        .select('SUM(o.hours)', 'totalHours')
        .where('o.user_id = :userId AND o.attendance_period_id = :periodId', { userId: user.id, periodId: attendancePeriodId })
        .getRawOne();
      const overtimePay = (parseFloat(overtime.totalHours || 0) * 50000).toFixed(2); // Example: 50k per hour
      // Reimbursements
      const reimbursement = await this.reimbursementRepo
        .createQueryBuilder('r')
        .select('SUM(r.amount)', 'total')
        .where('r.user_id = :userId AND r.attendance_period_id = :periodId', { userId: user.id, periodId: attendancePeriodId })
        .getRawOne();
      const reimbursementTotal = (parseFloat(reimbursement.total || 0)).toFixed(2);
      // Total
      const total = (parseFloat(baseSalary) + parseFloat(overtimePay) + parseFloat(reimbursementTotal)).toFixed(2);
      payslips.push(
        this.payslipRepo.create({
          userId: user.id,
          attendancePeriodId: Number(attendancePeriodId),
          baseSalary,
          overtimePay,
          reimbursementTotal,
          totalTakeHome: total,
          createdBy: userPayload.id,
          updatedBy: userPayload.id,
          ipAddress: userPayload.ip_address,
        })
      );
    }
    await this.payslipRepo.save(payslips);
    // Lock the period
    period.status = 'processed';
    period.processedAt = new Date();
    period.updatedBy = userPayload.id;
    await this.periodRepo.save(period);
    return payslips;
  }
}
