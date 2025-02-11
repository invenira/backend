import axios from 'axios';
import * as jwt from 'jsonwebtoken';

/* eslint-disable */
/* tslint-disable */

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '3000';

const token = jwt.sign(
  {
    preferred_username: 'testAdmin',
    realm_access: {
      roles: ['app_admin'],
    },
    azp: '...',
  },
  '123456789',
  {
    expiresIn: '1h',
    issuer: 'test',
  },
);

axios.defaults.baseURL = `http://${host}:${port}`;
axios.defaults.headers.get['Authorization'] =
  // @ts-ignore
  `Bearer ${token}`;

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Authorization'] =
  // @ts-ignore
  `Bearer ${token}`;
