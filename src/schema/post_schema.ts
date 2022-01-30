import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { BaseDoc } from '../common/base_types';

@modelOptions({
  schemaOptions: { collection: 'post', timestamps: true },
  options: { allowMixed: Severity.ALLOW }
})
export class PostDoc extends BaseDoc {
  @prop()
  public title?: string;

  @prop()
  public content?: string;

  @prop()
  public excerpt?: string;

  @prop()
  public removed?: boolean;
}
