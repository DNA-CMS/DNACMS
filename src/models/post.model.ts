import {
  index,
  Severity,
  prop,
  getModelForClass,
  modelOptions,
  mongoose
} from '@typegoose/typegoose';

@index({ postId: 1 }, { unique: true, background: true })
@modelOptions({
  schemaOptions: { collection: 'posts', timestamps: true },
  options: { allowMixed: Severity.ALLOW }
})
export class Post {
  public _id!: mongoose.Types.ObjectId;
  public createdAt!: Date;
  public updatedAt!: Date;

  @prop()
  public title?: string;

  @prop()
  public content?: string;

  @prop()
  public excerpt?: string;
}
const PostModel = getModelForClass(Post);

export default PostModel;
