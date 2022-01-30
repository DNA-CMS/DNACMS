import { interfaces } from 'inversify';
import Newable = interfaces.Newable;

export interface IOCClassConfig {
  class: Newable<any>;
  implementation?: Newable<any>;
  singleton?: boolean;
  config?: Record<string, any>;
}

export interface IOCConfig {
  classes: IOCClassConfig[];
}

export const IOCConfigSymbol = Symbol.for('IOCConfig');
