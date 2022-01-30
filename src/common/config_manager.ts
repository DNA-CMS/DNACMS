import { inject, injectable } from 'inversify';
import { IOCConfig, IOCConfigSymbol } from './ioc_types';

@injectable()
export class ConfigManager {
  private readonly classConfig: Map<string, Record<string, any>> = new Map();

  constructor(@inject(IOCConfigSymbol) private readonly iocConfig: IOCConfig) {
    this.fillClassConfig();
  }

  private fillClassConfig(): void {
    const addToClassConfig = (name: string, value: Record<string, any> | undefined): void => {
      if (this.classConfig.has(name)) {
        throw new Error(`Found the second configuration for ${name}`);
      }
      if (value) {
        this.classConfig.set(name, value);
      }
    };
    for (const classData of this.iocConfig.classes) {
      addToClassConfig(classData.class.name, classData.config);
      if (classData.implementation) {
        addToClassConfig(classData.implementation.name, classData.config);
      }
    }
  }

  public getConfig(cls?: object | NewableFunction | string): Record<string, any> {
    let clsName: string | undefined;
    switch (typeof cls) {
      case 'undefined':
        break;
      case 'string':
        clsName = cls;
        break;
      case 'function':
        clsName = cls.name;
        break;
      case 'object':
        clsName = cls.constructor.name;
        break;
      default:
        throw new Error(`Can't get name for type ${typeof cls}`);
    }
    if (!clsName) {
      throw new Error("Name of class wasn't found while getConfig");
    }
    const res = this.classConfig.get(clsName);
    return res ?? {};
  }
}
