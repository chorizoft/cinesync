import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';

describe('MoviesController', () => {
  let controller: MovieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
    }).compile();

    controller = module.get<MovieController>(MovieController);
  });

  it.skip('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
