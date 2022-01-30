import { Container, injectable } from 'inversify';
import 'reflect-metadata';
import { initSystem } from './base/init';
import { Base } from './common/base';
import { Finalizer } from './common/finalizer';
import { leanObject } from './common/helpers';
import { PostRepo } from './repo/post_repo';

@injectable()
class Main extends Base {
  constructor(ioc: Container, private readonly postRepo: PostRepo) {
    super(ioc);
  }

  public async main(): Promise<void> {
    this.logger.info('hello world');
    const post = await this.postRepo.create({ title: 'test post' });
    const check = await this.postRepo.get(post._id);
    this.logger.info(`Post is ${JSON.stringify(leanObject(check))}`);
  }
}

async function main(): Promise<void> {
  const ioc = await initSystem();
  ioc.bind(Main).toSelf().inSingletonScope();
  try {
    await ioc.get(Main).main();
  } finally {
    await ioc.get(Finalizer)?.finalize();
  }
}

main().then(
  // eslint-disable-next-line no-console
  () => console.log('Done'),
  // eslint-disable-next-line no-console
  (err) => console.error(err)
);
