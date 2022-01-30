import { mongoose, ReturnModelType } from '@typegoose/typegoose';
import { Container, injectable } from 'inversify';
import { Model } from '../base/model';
import { BaseRepo } from '../common/base_types';
import { PostDoc } from '../schema/post_schema';
import ObjectId = mongoose.Types.ObjectId;

@injectable()
export class PostRepo extends BaseRepo {
  declare model: ReturnModelType<typeof PostDoc>;

  constructor(ioc: Container, model: Model) {
    super(ioc);
    this.model = model.getModel(PostDoc);
  }

  public async get(
    _id: ObjectId,
    options?: { noThrow?: false; projection?: boolean }
  ): Promise<PostDoc>;
  public async get(
    _id: ObjectId,
    options?: { noThrow: true; projection?: boolean }
  ): Promise<PostDoc | undefined>;
  public async get(
    _id: ObjectId,
    options?: { noThrow?: boolean; projection?: boolean }
  ): Promise<PostDoc | undefined> {
    return await this.findOneByQuery({ _id }, options);
  }

  public async create(post: Partial<PostDoc>): Promise<PostDoc> {
    return await this.model.create(post);
  }
}
