import { LogLevel } from './log-level';

export class LogService {
  public static writeLog(level: LogLevel, message: string): void {
    console.log(`[${level}] ${message}`);
  }
}
