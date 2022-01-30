import { Model } from '../base/model';
import { getEnv } from '../common/helpers';
import { IOCConfig } from '../common/ioc_types';
import { Logger, LoggerConfig } from '../common/logger';
import { ModelConfig } from '../common/model_base';

const iocConfig: IOCConfig = {
  classes: [
    {
      class: Logger,
      config: {
        level: 'info'
      } as LoggerConfig
    },
    {
      class: Model,
      config: {
        mongoUri: getEnv('mongoUri'),
        createIndexes: true,
        syncIndexes: true,
        secondaryPreferred: false,
        autoRegisterModels: true
      } as ModelConfig
    }
  ]
};

export default iocConfig;
