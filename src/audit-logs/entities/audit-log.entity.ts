import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', name: 'request_id', nullable: true })
  requestId: string;

  @Column('varchar', { length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 50, name: 'table_name' })
  tableName: string;

  @Column({ type: 'varchar', name: 'record_id' })
  recordId: string;

  @Column('jsonb')
  changes?: object;

  @Column({ type: 'varchar', name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
