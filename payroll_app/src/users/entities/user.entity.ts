import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  role: 'admin' | 'employee';

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salary: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  created_by: number;

  @Column({ type: 'bigint', nullable: true })
  updated_by: number;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string;
}