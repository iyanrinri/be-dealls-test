import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaySlipTable1749269309437 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "salary_per_hour" decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "working_days" integer`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "attendance_count" integer`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "performance_attendance" decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "salary_base_attendance_count" decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "overtime_unit_percentage" float`);
        await queryRunner.query(`ALTER TABLE "payslips" ADD COLUMN "overtime_value" decimal(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "performance_attendance"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "salary_base_attendance_count"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "overtime_value"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "overtime_unit_percentage"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "attendance_count"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "working_days"`);
        await queryRunner.query(`ALTER TABLE "payslips" DROP COLUMN "salary_per_hour"`);
    }

}
