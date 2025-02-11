// src/api/graphqlFetcher.js
import axios from 'axios';
import { print } from 'graphql/language/printer';

/* eslint-disable */
/* tslint-disable */

// @ts-ignore
export const fetchGraphQL = async (query, variables = {}) => {
  const queryString = typeof query === 'string' ? query : print(query);

  const response = await axios.post('/graphql', {
    query: queryString,
    variables,
  });

  if (response.data.errors) {
    throw new Error(
      response.data.errors[0]?.message || 'Error fetching GraphQL data',
    );
  }

  return response.data.data;
};
