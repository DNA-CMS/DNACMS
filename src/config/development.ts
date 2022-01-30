import { IOCConfig } from '../common/ioc_types';
import { Logger, LoggerConfig } from '../common/logger';

const iocConfig: IOCConfig = {
  classes: [
    {
      class: Logger,
      config: {
        level: 'info'
      } as LoggerConfig
    }
  ]
};

export default iocConfig;
