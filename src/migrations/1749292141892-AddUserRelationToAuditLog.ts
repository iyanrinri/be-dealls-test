import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelationToAuditLog1749292141892 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "audit_logs"
            ADD CONSTRAINT "FK_audit_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_user_id"
        `);
    }
}
