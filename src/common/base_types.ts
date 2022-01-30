import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { injectable } from 'inversify';
import { Base } from './base';
import ObjectId = mongoose.Types.ObjectId;

@injectable()
export class BaseRepo extends Base {
  protected model: ReturnModelType<any>;

  protected findOneByQuery(
    query: any,
    options?: { noThrow?: boolean; projection?: boolean }
  ): Promise<any> {
    const doc = this.model.findOne(query, options?.projection);
    if (!options?.noThrow && !doc) {
      throw new Error(`Can't find ${this.model.name} by ${JSON.stringify(query)}`);
    }
    return doc ?? undefined;
  }
}

export class BaseDoc {
  public _id!: ObjectId;
  public createdAt!: Date;
  public updatedAt!: Date;
}
