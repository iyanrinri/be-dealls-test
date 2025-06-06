import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePayrollPeriod1749161479461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendance_periods',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            enum: ['open', 'processed'],
            default: "'open'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
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
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        checks: [
          {
            name: 'valid_period',
            expression: 'start_date <= end_date',
          },
        ],
        uniques: [
          {
            name: 'unique_period',
            columnNames: ['start_date', 'end_date'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'attendance_periods',
      new TableIndex({
        name: 'IDX_attendance_periods_created_by',
        columnNames: ['created_by'],
      }),
    );
    await queryRunner.createIndex(
      'attendance_periods',
      new TableIndex({
        name: 'IDX_attendance_periods_updated_by',
        columnNames: ['updated_by'],
      }),
    );
    await queryRunner.createIndex(
      'attendance_periods',
      new TableIndex({
        name: 'IDX_attendance_periods_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'attendance_periods',
      new TableIndex({
        name: 'IDX_attendance_periods_processed_at',
        columnNames: ['processed_at'],
      }),
    );
    await queryRunner.createIndex(
      'attendance_periods',
      new TableIndex({
        name: 'IDX_attendance_periods_date',
        columnNames: ['start_date', 'end_date'],
      }),
    );

    await queryRunner.createForeignKeys('attendance_periods', [
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
        CREATE TRIGGER update_attendance_periods_timestamp
        BEFORE UPDATE ON attendance_periods
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attendance_periods');
  }
}
