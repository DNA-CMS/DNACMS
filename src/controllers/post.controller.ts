import { FilterQuery } from 'mongoose';
import PostModel, { Post } from '../models/post.model';

export async function getPost(input: FilterQuery<Post>): Promise<Post | null> {
  const post = await PostModel.findOne(input);

  return post;
}
