import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar' })
  request_id: string;

  @Column('varchar', { length: 50 })
  action: string;

  @Column('varchar', { length: 50 })
  table_name: string;

  @Column('varchar')
  record_id: string;

  @Column('jsonb')
  changes: object;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}