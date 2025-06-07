import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIpAddressFromTables1749286774325 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "overtimes" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "attendance_periods" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "reimbursements" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN IF EXISTS "ip_address"`);
        // Do NOT remove from audit_logs
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "ip_address" varchar`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD COLUMN "ip_address" varchar`);
        await queryRunner.query(`ALTER TABLE "overtimes" ADD COLUMN "ip_address" varchar`);
        await queryRunner.query(`ALTER TABLE "attendance_periods" ADD COLUMN "ip_address" varchar`);
        await queryRunner.query(`ALTER TABLE "reimbursementss" ADD COLUMN "ip_address" varchar`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "ip_address" varchar`);
    }
}
