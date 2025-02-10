import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const ALL_ROLES = [
  'app_admin',
  'app_creator',
  'app_deployer',
  'app_active_agent',
  'app_awareness_agent',
];

export const INSTRUCTOR_ROLES = [
  'app_admin',
  'app_creator',
  'app_deployer',
  'app_awareness_agent',
];
