import { Container, injectable } from 'inversify';
import { ModelBase } from '../common/model_base';

@injectable()
export class Model extends ModelBase {
  constructor(ioc: Container) {
    super(ioc);
  }
}
