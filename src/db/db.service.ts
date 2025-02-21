import { IMutation, IQuery } from '@invenira/schemas';

// TODO: Improve abstraction. Currently, queries that do not require DbAccess,
//  are still required to be implemented in the DbService.
export interface DbService extends IQuery, IMutation {}

export const DB_SERVICE = 'INVENIRA_DB_SERVICE';
