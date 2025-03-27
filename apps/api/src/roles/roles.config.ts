import { ROLE_NAMES, ROLE_STATUS } from '@app/common';

export const DEFAULT_ROLES = [
  {
    name: ROLE_NAMES.ROOT,
    status: ROLE_STATUS.ACTIVE,
    descendants: [ROLE_NAMES.ADMIN, ROLE_NAMES.PLAYER],
  },
  {
    name: ROLE_NAMES.ADMIN,
    status: ROLE_STATUS.ACTIVE,
    descendants: [ROLE_NAMES.PLAYER],
  },
  { name: ROLE_NAMES.PLAYER, status: ROLE_STATUS.ACTIVE, descendants: [] },
];
