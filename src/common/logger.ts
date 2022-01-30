import PrettyStream from 'bunyan-prettystream';
import bunyan from 'bunyan';
import { injectable } from 'inversify';
import { ConfigManager } from './config_manager';

@injectable()
export class Logger {
  private readonly logger: bunyan;
  private readonly config: Record<string, any>;
  private readonly level: bunyan.LogLevelString;

  constructor(cm: ConfigManager) {
    this.config = cm.getConfig(this);
    this.level = this.config['level?'] || 'info';
    this.logger = this.createLogger();
  }

  private createLogger(): bunyan {
    const stream = new PrettyStream({ mode: 'short', useColor: Boolean(process.stdout.isTTY) });
    stream.pipe(process.stdout);
    const logger = bunyan.createLogger({
      name: 'log',
      level: this.level,
      streams: [{ level: this.level, stream }]
    });
    return logger;
  }

  public info(): boolean;
  public info(error: Error, ...params: any[]): void;
  public info(obj: Object, ...params: any[]): void;
  public info(format: any, ...params: any[]): void;
  public info(...params: any[]): any {
    return this.logger.info(params[0], ...params.slice(1));
  }
  public warn(): boolean;
  public warn(error: Error, ...params: any[]): void;
  public warn(obj: Object, ...params: any[]): void;
  public warn(format: any, ...params: any[]): void;
  public warn(...params: any[]): any {
    return this.logger.warn(params[0], ...params.slice(1));
  }
  public error(): boolean;
  public error(error: Error, ...params: any[]): void;
  public error(obj: Object, ...params: any[]): void;
  public error(format: any, ...params: any[]): void;
  public error(...params: any[]): any {
    return this.logger.error(params[0], ...params.slice(1));
  }
  public debug(): boolean;
  public debug(error: Error, ...params: any[]): void;
  public debug(obj: Object, ...params: any[]): void;
  public debug(format: any, ...params: any[]): void;
  public debug(...params: any[]): any {
    return this.logger.debug(params[0], ...params.slice(1));
  }
}
