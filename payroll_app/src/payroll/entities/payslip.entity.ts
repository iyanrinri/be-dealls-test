import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AttendancePeriod } from '../../attendances/entities/attendance-period.entity';

@Entity('payslips')
export class Payslip {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ name: 'attendance_period_id', type: 'integer' })
  attendancePeriodId: number;

  @Column({ name: 'base_salary', type: 'decimal', precision: 10, scale: 2 })
  baseSalary: string;

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 10, scale: 2 })
  overtimePay: string;

  @Column({ name: 'reimbursement_total', type: 'decimal', precision: 10, scale: 2 })
  reimbursementTotal: string;

  @Column({ name: 'total_take_home', type: 'decimal', precision: 10, scale: 2 })
  totalTakeHome: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AttendancePeriod)
  @JoinColumn({ name: 'attendance_period_id' })
  attendancePeriod: AttendancePeriod;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy?: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress?: string;
}
