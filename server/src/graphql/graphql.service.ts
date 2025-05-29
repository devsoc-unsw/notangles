import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql/graphql';

const HASURAGRES_GRAPHQL_API = 'https://graphql.csesoc.app/v1/graphql';

@Injectable()
export class GraphqlService {
  private readonly sdk: ReturnType<typeof getSdk>;

  constructor() {
    const client = new GraphQLClient(HASURAGRES_GRAPHQL_API);
    this.sdk = getSdk(client);
  }

  async courseExists(courseId: string, term: string): Promise<boolean> {
    const { courseExists } = await this.sdk.CourseExists({
      courseId,
      term,
    });

    return courseExists.aggregate != null && courseExists.aggregate.count > 0;
  }
}
