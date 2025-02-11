import { gql } from 'graphql-tag';
import { fetchGraphQL } from '../fetchGraphQL';

/* eslint-disable */
/* tslint-disable */

describe('GraphQL API (e2e)', () => {
  it('/graphql (getActivities)', async () => {
    const GET_ACTIVITIES_QUERY = gql`
      query GetActivities {
        getActivities {
          _id
          name
        }
      }
    `;

    const response = await fetchGraphQL(GET_ACTIVITIES_QUERY);

    expect(response).toStrictEqual({ getActivities: [] });
  });
});
