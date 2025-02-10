import { IMutation, IQuery } from '@invenira/schemas';

export interface DbService extends IQuery, IMutation {}

export const DB_SERVICE = 'INVENIRA_DB_SERVICE';
