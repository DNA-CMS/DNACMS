import { Container, injectable } from 'inversify';
import { ConfigManager } from './config_manager';
import { Logger } from './logger';
import { Finalizer } from './finalizer';

@injectable()
export class Base {
  protected readonly logger: Logger;
  protected readonly configManager: ConfigManager;
  protected readonly config: Record<string, any>;
  protected readonly finalizer: Finalizer;

  constructor(protected readonly ioc: Container) {
    this.logger = ioc.get(Logger);
    this.configManager = ioc.get(ConfigManager);
    this.config = this.configManager.getConfig(this);
    this.finalizer = ioc.get(Finalizer);
  }
}
