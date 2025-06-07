import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { Logger } from 'winston';
import { loggerConfig } from '../config/logger.config';
import * as winston from 'winston';

@Injectable()
export class AuditLogService {
  private logger: Logger;
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {
    this.logger = winston.createLogger(loggerConfig);
  }

  async createAuditLog(
    dto: CreateAuditLogDto,
    user: UserPayload,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId: user.id,
      action: dto.action,
      tableName: dto.tableName,
      recordId: dto.recordId,
      changes: dto.changes,
      ipAddress: user.ip_address || undefined,
      createdAt: new Date(),
      requestId: user.request_id || uuidv4(),
    });

    return this.auditLogRepository.save(auditLog);
  }

  async logAction(
    user: UserPayload,
    action: string,
    tableName: string,
    recordId: string,
    changes: any,
  ): Promise<AuditLog> {
    const auditLogDto: CreateAuditLogDto = {
      userId: user.id,
      requestId: user.request_id || undefined,
      action,
      tableName,
      recordId,
      ipAddress: user.ip_address || undefined,
      changes,
    };
    this.logger.info(`[AUDIT] ${JSON.stringify(auditLogDto)}`);
    return this.createAuditLog(auditLogDto, user);
  }

  async findAllWithUser({
    employeeId,
    startDate,
    endDate,
  }: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    const where: any = {};
    if (employeeId) {
      where.userId = employeeId;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    }
    return this.auditLogRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
