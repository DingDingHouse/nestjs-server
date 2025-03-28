export const ROLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
} as const;

export type RoleStatus = (typeof ROLE_STATUS)[keyof typeof ROLE_STATUS];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
