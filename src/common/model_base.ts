import {
  getModelForClass,
  ReturnModelType,
  setGlobalOptions,
  Severity
} from '@typegoose/typegoose';
import assert from 'assert';
import * as fs from 'fs';
import { Container, injectable } from 'inversify';
import mongoose from 'mongoose';
import path from 'path';
import { Base } from './base';

type ClassType = new () => Object;
type ModelMapping = { [name: string]: ClassType };

export interface ModelConfig {
  mongoUri: string;
  syncIndexes: boolean;
  createIndexes: boolean;
  /** if secondary preferred for connection */
  secondaryPreferred: boolean;
}

@injectable()
export class ModelBase extends Base {
  private mapping: ModelMapping = {};
  private inited = false;
  protected declare readonly config: ModelConfig;

  constructor(ioc: Container) {
    super(ioc);
    if (ioc.isBound(ModelBase)) {
      throw new Error("Can't have more than one instance of ModelBase");
    }
    ioc.bind(ModelBase).toConstantValue(this);
    setGlobalOptions({
      options: { allowMixed: Severity.ALLOW },
      schemaOptions: {
        minimize: false,
        autoIndex: true,
        strict: 'throw',
        strictQuery: 'throw'
      },
      globalOptions: { useNewEnum: true }
    });
  }

  public registerSchemaClasses(
    classes: Array<ClassType | { base: ClassType; impl: ClassType }>
  ): void {
    for (const desc of classes) {
      let cls;
      let impl;
      // noinspection SuspiciousTypeOfGuard
      if (desc instanceof Function) {
        cls = desc;
        impl = desc;
      } else {
        if (!desc.base || !desc.impl) {
          throw new Error(`base and impl must be defined in ${JSON.stringify(desc)}`);
        }
        cls = desc.base;
        impl = desc.impl;
      }
      const name = this.getClassName(cls);
      if (name in this.mapping) {
        throw new Error(`Class for '${name} can't be defined twice`);
      }
      this.mapping[name] = impl;
    }
  }

  public isInitialized(): boolean {
    return this.inited;
  }

  private bindModelClasses(): void {
    for (const [name, cls] of Object.entries(this.mapping)) {
      if (this.ioc.isBound(name)) {
        continue;
      }
      this.ioc
        .bind(name)
        .toDynamicValue(() => {
          this.logger.debug(`construct model for ${name}`);
          return getModelForClass(cls);
        })
        .inSingletonScope();
    }
  }

  public async init(): Promise<void> {
    if (this.inited) {
      throw new Error("Can't call model.init twice");
    }
    this.bindModelClasses();
    const options: mongoose.ConnectOptions = {
      autoIndex: this.config.secondaryPreferred ? false : this.config.createIndexes
    };
    if (this.config.secondaryPreferred) {
      const type = 'secondaryPreferred';
      this.logger.info(`set MongoDB default readPreference to ${type}`);
      options.readPreference = type;
    }
    await mongoose.connect(this.config.mongoUri, options);
    this.finalizer.addFinalizer(this, this.close.bind(this));
    const msg = `Initialize collections and ${this.config.syncIndexes ? 'sync' : 'create'} indexes`;
    this.logger.info(msg);
    if (this.logger.debug()) {
      mongoose.set('debug', (col: string, func: string, ...args: any) =>
        this.mongoosePrintLog(col, func, args)
      );
    }
    const promises = Object.keys(this.mapping).map(async (name) => {
      const model = this.ioc.get(name) as ReturnModelType<any>;
      await initModel(model);
      this.logger.debug(`initialized ${name}`);
      if (this.config.syncIndexes) {
        await model.syncIndexes();
      }
    });
    promises.push(this.bindRepos());
    promises.push(this.bindModels());
    try {
      await Promise.all(promises);
    } catch (e: any) {
      if (e instanceof Error) {
        this.logger.error(e, 'Error while initializing models');
      }
      throw e;
    }
    this.inited = true;
    this.logger.info(`${msg}: finished`);
  }

  public async close(): Promise<void> {
    if (this.inited) {
      await mongoose.disconnect();
      this.finalizer.removeFinalizer(this);
    }
  }

  public getModel<T extends ClassType>(model: T): ReturnModelType<T> {
    const name = this.getClassName(model);
    if (!(name in this.mapping)) {
      throw new Error(`Model for class '${model.name}' wasn't registered`);
    }
    return this.ioc.get(name);
  }

  private getClassName(cls: ClassType): string {
    return `model.${cls.name}`;
  }

  private async bindRepos(): Promise<void> {
    const repoDir = path.join(__dirname, '../repo');
    this.logger.debug('Loading repos from directory %s', repoDir);
    const repos = fs.readdirSync(repoDir);
    for (const file of repos) {
      if (file.endsWith('.d.ts')) {
        continue;
      }
      const repo = path.join(repoDir, file);
      if (!fs.lstatSync(repo).isFile()) {
        continue;
      }
      this.logger.debug('Loading repo %s', repo);
      const module: any = await import(repo);
      const classNames = Object.keys(module).filter((name) => name.endsWith('Repo'));
      if (classNames.length !== 1) {
        throw new Error(`File ${repo} must contain exactly one repo class`);
      }
      assert(!this.ioc.isBound(module[classNames[0]]), `Repo ${classNames[0]} is already bound`);
      this.ioc.bind(module[classNames[0]]).toSelf().inSingletonScope();
    }
    this.logger.debug('Loading repos finished');
  }

  private async bindModels(): Promise<void> {
    const repoDir = path.join(__dirname, '../schema');
    this.logger.debug('Loading models from directory %s', repoDir);
    const repos = fs.readdirSync(repoDir);
    for (const file of repos) {
      if (file.endsWith('.d.ts')) {
        continue;
      }
      const model = path.join(repoDir, file);
      if (!fs.lstatSync(model).isFile()) {
        continue;
      }
      this.logger.debug('Loading model %s', model);
      const module: any = await import(model);
      const classNames = Object.keys(module).filter((name) => name.endsWith('Doc'));
      for (const cls of classNames) {
        assert(!this.ioc.isBound(module[cls]), `Model ${cls} is already bound`);
        this.ioc.bind(module[cls]).toSelf().inSingletonScope();
      }
    }
    this.logger.debug('Loading models finished');
  }

  private mongoosePrintLog(col: string, func: string, args: any[]): void {
    if (!args) {
      args = [];
    }
    this.logger.debug(`mongoose: ${col}.${func}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
  }
}

function initModel(model: ReturnModelType<any>): Promise<void> {
  return new Promise((resolve, reject) => {
    model.on('index', (err: any) => {
      if (!err) {
        return;
      }
      reject(
        new Error(
          `Error while initialize collection '${model.collection.collectionName}': ${err.message}`
        )
      );
    });
    model.init().then(resolve).catch(reject);
  });
}
