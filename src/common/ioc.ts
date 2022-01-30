import deepmerge from 'deepmerge';
import { Container } from 'inversify';
import { IOCConfig, IOCConfigSymbol } from './ioc_types';
import { Logger } from './logger';

export async function loadClass(
  moduleFile: string,
  options?: { debug?: boolean; noThrow?: boolean }
): Promise<any | undefined> {
  if (options?.debug) {
    // eslint-disable-next-line no-console
    console.log('%s Loading module from %s', new Date().toISOString(), moduleFile);
  }
  let module;
  try {
    module = await import(moduleFile);
  } catch (e) {
    if (options?.noThrow) {
      return undefined;
    }
    throw e;
  }
  if (!module) {
    throw new Error(`Can't load  module ${moduleFile}`);
  }
  if (!module.default) {
    throw new Error(`No default in module ${moduleFile}`);
  }
  return module.default;
}

function isClassArray(arr: any[]): boolean {
  return arr.every((i) => typeof i === 'object' && i.class);
}

function arrayMerge(target: any[], source: any[]): any[] {
  if (!isClassArray(target) || !isClassArray(source)) {
    return deepmerge({ arr: target }, { arr: source }, { arrayMerge: (d, s) => s }).arr;
  }
  for (const item of source) {
    const targetItem = target.find((i) => i.class === item.class);
    if (targetItem) {
      Object.assign(targetItem, deepmerge(targetItem, item, { arrayMerge: (d, s) => s }));
    } else {
      target.push(item);
    }
  }
  return target;
}

async function getConfig(debug?: boolean): Promise<IOCConfig> {
  const configs = [
    await loadClass('./ioc_base_config', { debug }),
    await loadClass('../config/default', { debug })
  ];
  const customConfigPath = `../config/${process.env.NODE_ENV || 'development'}`;
  const customConfig = await loadClass(customConfigPath, { debug, noThrow: true });
  if (customConfig) {
    configs.push(customConfig);
  }
  return deepmerge.all(configs, {
    arrayMerge
  }) as IOCConfig;
}

function isDebug(config: IOCConfig): boolean {
  const loggerConfig = config.classes.find((conf) => conf.class === Logger);
  return loggerConfig?.config?.level === 'debug';
}

export async function getIOC(): Promise<Container> {
  const config = await getConfig();
  const debug = isDebug(config);
  const container = new Container({ skipBaseClassChecks: true });
  container.bind(IOCConfigSymbol).toConstantValue(config);
  container.bind(Container).toConstantValue(container);
  for (const classCfg of config.classes) {
    const className = classCfg.class.name;
    if (debug) {
      // eslint-disable-next-line no-console
      console.debug('%s load class %s', new Date().toISOString(), className);
    }
    let binding;
    if (classCfg.implementation) {
      binding = container.bind(classCfg.class).to(classCfg.implementation);
    } else {
      binding = container.bind(classCfg.class).toSelf();
    }
    if (!classCfg.singleton) {
      binding.inSingletonScope();
    } else {
      binding.inTransientScope();
    }
  }
  return container;
}
