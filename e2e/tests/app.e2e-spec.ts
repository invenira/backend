import { gql } from 'graphql-tag';
import { fetchGraphQL } from '../fetchGraphQL';

/* eslint-disable */
/* tslint-disable */

describe('GraphQL API Queries empty results (e2e)', () => {
  it('/graphql (getActivityProviders)', async () => {
    const QUERY = gql`
      query GetActivityProviders {
        getActivityProviders {
          _id
        }
      }
    `;

    const response = await fetchGraphQL(QUERY);

    expect(response).toStrictEqual({ getActivityProviders: [] });
  });

  it('/graphql (getActivityProvider)', async () => {
    const QUERY = gql`
      query GetActivityProvider {
        getActivityProvider(apId: "....") {
          _id
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getActivityProviderRequiredFields)', async () => {
    const QUERY = gql`
      query GetActivityProvidersRequiredFields {
        getActivityProviderRequiredFields(apId: "....")
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getActivityProviderActivities)', async () => {
    const QUERY = gql`
      query GetActivityProvidersActivities {
        getActivityProviderActivities(apId: "....") {
          _id
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getConfigurationInterfaceUrl)', async () => {
    const QUERY = gql`
      query GetConfigurationInterfaceUrl {
        getConfigurationInterfaceUrl(apId: "....") {
          url
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getConfigurationParameters)', async () => {
    const QUERY = gql`
      query GetConfigurationParameters {
        getConfigurationParameters(apId: "....")
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getActivities)', async () => {
    const QUERY = gql`
      query GetActivities {
        getActivities {
          _id
        }
      }
    `;

    const response = await fetchGraphQL(QUERY);

    expect(response).toStrictEqual({ getActivities: [] });
  });

  it('/graphql (getActivity)', async () => {
    const QUERY = gql`
      query GetActivity {
        getActivity(activityId: "....") {
          _id
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getIAPs)', async () => {
    const QUERY = gql`
      query GetIAPs {
        getIAPs {
          _id
        }
      }
    `;

    const response = await fetchGraphQL(QUERY);

    expect(response).toStrictEqual({ getIAPs: [] });
  });

  it('/graphql (getIAP)', async () => {
    const QUERY = gql`
      query GetIAP {
        getIAP(iapId: "....") {
          _id
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });

  it('/graphql (getIAPAvailableMetrics)', async () => {
    const QUERY = gql`
      query GetIAPAvailableMetrics {
        getIAPAvailableMetrics(iapId: "....") {
          name
        }
      }
    `;

    await expect(fetchGraphQL(QUERY)).rejects.toThrow(
      'Request failed with status code 400',
    );
  });
});

describe('GraphQL API Mutations (e2e)', () => {
  describe('/graphql (createActivityProvider)', () => {
    it('Invalid URL returns error', async () => {
      const QUERY = gql`
        mutation CreateActivityProvider {
          createActivityProvider(
            createActivityProviderInput: {
              name: "..."
              description: "..."
              url: "..."
            }
          ) {
            _id
          }
        }
      `;

      await expect(fetchGraphQL(QUERY)).rejects.toThrow(
        'Request validation errors: Invalid Activity Provider URL',
      );
    });

    it('Invalid Name returns error', async () => {
      const QUERY = gql`
        mutation CreateActivityProvider {
          createActivityProvider(
            createActivityProviderInput: {
              name: ".."
              description: "..."
              url: "http://localhost"
            }
          ) {
            _id
          }
        }
      `;

      await expect(fetchGraphQL(QUERY)).rejects.toThrow(
        'Request validation errors: Activity Provider name must have a length of 3 or more!',
      );
    });

    it('Invalid Description returns error', async () => {
      const QUERY = gql`
        mutation CreateActivityProvider {
          createActivityProvider(
            createActivityProviderInput: {
              name: ".."
              description: ".."
              url: "..."
            }
          ) {
            _id
          }
        }
      `;

      await expect(fetchGraphQL(QUERY)).rejects.toThrow(
        'Request validation errors: Activity Provider name must have a length of 3 or more!; Invalid Activity Provider URL',
      );
    });

    it('Unreachable Activity Provider returns error', async () => {
      const QUERY = gql`
        mutation CreateActivityProvider {
          createActivityProvider(
            createActivityProviderInput: {
              name: "..."
              description: ".."
              url: "http://localhost:12345"
            }
          ) {
            _id
          }
        }
      `;

      await expect(fetchGraphQL(QUERY)).rejects.toThrow(Error);
    });

    it('Creates an Activity Provider', async () => {
      const QUERY = gql`
        mutation CreateActivityProvider {
          createActivityProvider(
            createActivityProviderInput: {
              name: "AP1"
              description: "AP1 Description"
              url: "http://localhost:8888"
            }
          ) {
            name
            description
            url
          }
        }
      `;

      const result = await fetchGraphQL(QUERY);

      expect(result.createActivityProvider).toStrictEqual({
        name: 'AP1',
        description: 'AP1 Description',
        url: 'http://localhost:8888',
      });
    });

    it('Finds an Activity Provider', async () => {
      let QUERY = gql`
        query GetActivityProviders {
          getActivityProviders {
            _id
            name
            description
            url
          }
        }
      `;

      const response = await fetchGraphQL(QUERY);

      expect(Array.isArray(response.getActivityProviders)).toBe(true);
      expect(response.getActivityProviders).toHaveLength(1);

      QUERY = gql`
        query GetActivityProvider($id: MongoIdScalar!) {
          getActivityProvider(apId: $id) {
            name
            description
            url
          }
        }
      `;

      const result = await fetchGraphQL(QUERY, {
        id: response.getActivityProviders[0]._id,
      });

      expect(result.getActivityProvider).toStrictEqual({
        name: 'AP1',
        description: 'AP1 Description',
        url: 'http://localhost:8888',
      });
    });
  });

  describe('/graphql (removeActivityProvider)', () => {
    it('Fails when try to delete non-existent AP', async () => {
      const QUERY = gql`
        mutation removeActivityProvider {
          removeActivityProvider(apId: "....")
        }
      `;

      await expect(fetchGraphQL(QUERY)).rejects.toThrow(
        'Request failed with status code 400',
      );
    });
  });

  describe('/graphql (createIap)', () => {
    it('Creates IAP', async () => {
      const QUERY = gql`
        mutation createIap {
          createIap(createIapInput: { name: "...", description: "..." }) {
            name
            description
          }
        }
      `;

      const result = await fetchGraphQL(QUERY);

      expect(result.createIap).toStrictEqual({
        name: '...',
        description: '...',
      });
    });

    it('Finds IAP', async () => {
      let QUERY = gql`
        query getIAPs {
          getIAPs {
            _id
          }
        }
      `;

      const response = await fetchGraphQL(QUERY);

      expect(Array.isArray(response.getIAPs)).toBe(true);
      expect(response.getIAPs).toHaveLength(1);

      QUERY = gql`
        query getIAP($id: MongoIdScalar!) {
          getIAP(iapId: $id) {
            name
            description
          }
        }
      `;

      const result = await fetchGraphQL(QUERY, {
        id: response.getIAPs[0]._id,
      });

      expect(result.getIAP).toStrictEqual({
        name: '...',
        description: '...',
      });
    });
  });
});
