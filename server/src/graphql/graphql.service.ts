import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';
import type { ClassDetails } from './types';

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

  async getClassDetails(classId: string): Promise<ClassDetails | undefined> {
    const { classDetails } = await this.sdk.ClassDetails({ classId });
    return classDetails ? classDetails : undefined;
  }

  async getAvailableTerms(): Promise<{ availableTerms: string[] }> {
    const result = await this.sdk.GetAvailableTerms();
    const classes = result.classes ?? [];
    const termsSet = new Set<string>();
    for (const cls of classes) {
      if (cls.term && cls.year) {
        termsSet.add(`${cls.term}-${cls.year}`);
      }
    }
    return { availableTerms: Array.from(termsSet) };
  }
}
