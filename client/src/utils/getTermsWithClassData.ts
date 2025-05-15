import { gql } from '@apollo/client';
import { client } from '../api/config';

const GET_CLASSES_WITH_TIMES = gql`
  query MyQuery($term: String!) {
    times_aggregate(
      where: {
        classe: {
          course: { course_code: { _eq: "COMP1511" } },
          term: { _eq: $term }
        }
      }
      limit: 1
    ) {
      aggregate {
        count
      }
    }
  }
`;


/**
 * Checks if a given term has any classes with timetable data
 *
 * @param term The term we want to check (e.g. "T1")
 * @returns True if the term has class data, else False
 * @example
 * bool exists  = await existsClassDataInTerm("T1")
 */

const existsClassDataInTerm = async (term: string): Promise<boolean> => {
  try {
    const { data } = await client.query({
      query: GET_CLASSES_WITH_TIMES,
      variables: { term },
    });
		
    return data?.times_aggregate?.aggregate?.count > 0;
  } catch (error) {
    console.error('Error fetching class data:', error);
    return false;
  }
};
  

/**
 * Returns a list of terms with class data, with the terms ordered by 
 * their appearance in the year - [U1, T1, T2, T3]
 *
 * @returns List of terms that have class data
 * @example
 * const termsWithData = await getTermsWithClassData();
 */
export const getTermsWithClassData = async (terms: string[]): Promise<string[]> => {  

  const termsWithData: string[] = [];
  
    for (const term of terms) {
      const hasClassData = await existsClassDataInTerm(term.substring(0, 2));
      if (hasClassData) {
        termsWithData.push(term);
      }
    }
  
    return termsWithData;
};