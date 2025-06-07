import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('reimbursements')
export class Reimbursement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'bigint', name: 'attendance_period_id' })
  attendancePeriodId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy?: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress?: string;
}
