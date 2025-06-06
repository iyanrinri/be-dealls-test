import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { UserPayload } from '../auth/interfaces/user-payload.interface';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

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
}
