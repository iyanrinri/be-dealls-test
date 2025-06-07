import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateOvertimeTable1749165062497 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'overtimes',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'attendance_period_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'overtime_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'hours',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'updated_by',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
        ],
        checks: [
          {
            name: 'check_hours',
            expression: 'hours <= 3',
          },
        ],
        uniques: [
          {
            name: 'unique_overtime',
            columnNames: ['user_id', 'overtime_date'],
          },
        ],
        indices: [
          new TableIndex({
            name: 'idx_overtime_user_date',
            columnNames: ['user_id', 'overtime_date'],
          }),
          new TableIndex({
            name: 'idx_overtime_attendance_period',
            columnNames: ['attendance_period_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('overtimes', [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['attendance_period_id'],
        referencedTableName: 'attendance_periods',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['updated_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    ]);
    await queryRunner.query(`
        CREATE TRIGGER update_overtimes_timestamp
        BEFORE UPDATE ON overtimes
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('overtimes');
  }
}
