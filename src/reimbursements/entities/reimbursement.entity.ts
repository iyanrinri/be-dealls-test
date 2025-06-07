import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

  @Column({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt?: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt?: Date;

  @Column({ type: 'bigint', name: 'created_by' })
  createdBy?: number;

  @Column({ type: 'bigint', name: 'updated_by' })
  updatedBy?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
