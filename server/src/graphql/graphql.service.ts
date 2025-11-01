import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../generated/graphql';
import type { ClassDetails } from './types';

const HASURAGRES_GRAPHQL_API = 'https://graphqlstaging.devsoc.app/v1/graphql';

@Injectable()
export class GraphqlService {
  private readonly sdk: ReturnType<typeof getSdk>;

  constructor() {
    const client = new GraphQLClient(HASURAGRES_GRAPHQL_API);
    this.sdk = getSdk(client);
  }

  async courseExists(courseId: string, term: string): Promise<boolean> {
    console.log(`Checking if course ${courseId} exists for term ${term}`);
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

  async getAvailableTermsFrom(
    currentYear: number = new Date().getFullYear(),
  ): Promise<{ availableTerms: string[] }> {
    const result = await this.sdk.GetAvailableTerms({
      currentYear: currentYear,
    });
    const classes = result.classes ?? [];
    const termsSet = new Set<string>();
    for (const cls of classes) {
      if (cls.term && cls.year) {
        termsSet.add(`${cls.term}-${cls.year}`);
      }
    }
    return { availableTerms: Array.from(termsSet) };
  }

  async getAllClassesFromCourses(
    courseIds: string[],
    mode: string,
    term: string,
  ): Promise<
    {
      course_id: string;
      class_id: string;
      activity: string;
      times: { day: string; time: string }[];
    }[]
  > {
    return (
      await this.sdk.GetAllClassesFromCourses({
        courseIds,
        mode,
        term,
      })
    ).classes;
  }
}
