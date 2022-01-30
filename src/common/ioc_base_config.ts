import { ConfigManager } from './config_manager';
import { IOCConfig } from './ioc_types';
import { Logger } from './logger';
import { Finalizer } from './finalizer';

const iocConfig: IOCConfig = {
  classes: [{ class: Logger }, { class: ConfigManager }, { class: Finalizer }]
};

export default iocConfig;
