export class CreateAuditLogDto {
  userId: number;
  requestId?: string;
  action: string;
  tableName: string;
  recordId: string;
  changes?: object;
  ipAddress?: string;
}
