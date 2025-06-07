import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAttendanceTable1749164350357 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendances',
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
            name: 'attendance_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'clock_in_time',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'clock_out_time',
            type: 'timestamp with time zone',
            isNullable: true,
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
        uniques: [
          {
            name: 'unique_attendance',
            columnNames: ['user_id', 'attendance_date'],
          },
        ],
        indices: [
          new TableIndex({
            name: 'idx_attendance_user_date',
            columnNames: ['user_id', 'attendance_date'],
          }),
          new TableIndex({
            name: 'idx_attendance_clock_in_out',
            columnNames: ['clock_in_time', 'clock_out_time'],
          }),
          new TableIndex({
            name: 'idx_attendance_attendance_period',
            columnNames: ['attendance_period_id'],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('attendances', [
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
        CREATE TRIGGER update_attendances_timestamp
        BEFORE UPDATE ON attendances
        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('attendances');
  }
}
