import { interfaces } from 'inversify';
import { Finalizer } from '../common/finalizer';
import { getIOC } from '../common/ioc';
import { Model } from './model';
import Container = interfaces.Container;

export async function initSystem(): Promise<Container> {
  const ioc = await getIOC();
  const model = ioc.get(Model);
  try {
    await model.init();
  } catch (e) {
    await ioc.get(Finalizer)?.finalize();
    throw e;
  }
  return ioc;
}
