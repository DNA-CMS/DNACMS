import { injectable } from 'inversify';
import { Logger } from './logger';

@injectable()
export class Finalizer {
  private readonly finalizers: Array<{ finalizer: () => any; owner: Object }> = [];
  private readonly owners: Map<Object, number> = new Map();
  private counter = 0;

  constructor(private readonly logger: Logger) {}

  private getUniqId(owner: Object): string {
    let id = this.owners.get(owner);
    if (!id) {
      id = ++this.counter;
      this.owners.set(owner, id);
    }
    return `${owner.constructor.name}-${id}`;
  }

  public addFinalizer(owner: Object, finalizer: () => any): void {
    if (this.findIndex(owner) >= 0) {
      throw new Error(`Object ${owner.constructor.name} has already registered a finalizer`);
    }
    this.logger.debug('Add finalizer for %s', this.getUniqId(owner));
    this.finalizers.push({ owner, finalizer });
  }

  public removeFinalizer(owner: Object): void {
    const i = this.findIndex(owner);
    if (i >= 0) {
      this.logger.debug('Remove finalizer for %s', this.getUniqId(owner));
      this.finalizers.splice(i, 1);
    } else {
      this.logger.debug("The finalizer for %s wasn't found", this.getUniqId(owner));
    }
  }

  public async finalize(skipObjs?: Object[]): Promise<void> {
    const promises = [];
    for (const finalizer of this.finalizers) {
      if (skipObjs?.some((obj) => obj === finalizer.owner)) {
        this.logger.warn(`Skip finalization of '${finalizer.owner.constructor?.name}'`);
        continue;
      }
      const res = finalizer.finalizer.call(finalizer.owner);
      if (res instanceof Promise) {
        promises.push(res);
      }
    }
    await Promise.all(promises);
  }

  private findIndex(owner: Object): number {
    for (let i = 0; i < this.finalizers.length; i++) {
      if (this.finalizers[i].owner === owner) {
        return i;
      }
    }
    return -1;
  }
}
