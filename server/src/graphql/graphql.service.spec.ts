import { Test, TestingModule } from '@nestjs/testing';
import { GraphqlService } from './graphql.service';

describe('GraphqlService', () => {
  let service: GraphqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphqlService],
    }).compile();

    service = module.get<GraphqlService>(GraphqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
