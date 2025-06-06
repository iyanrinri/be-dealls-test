/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { WinstonModuleOptions } from 'nest-winston';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
});

const excludeNestSystemLogs = winston.format((info) => {
  const ignoredMessages = [
    'dependencies initialized',
    'Starting Nest application...',
    'Mapped',
    'Controller {',
    'Nest application successfully started',
  ];

  const message = String(info.message); // 💡 cast ke string

  for (const msg of ignoredMessages) {
    if (message.includes(msg)) {
      return false;
    }
  }

  return info;
});

export const loggerConfig: WinstonModuleOptions = {
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    excludeNestSystemLogs(),
    myFormat,
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: path.join(process.cwd(), 'storage', 'logs'),
      filename: 'app-%DATE%.log', // <- bikin log harian
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '7d',
      level: 'info',
    }),
    new winston.transports.Console(),
  ],
};
