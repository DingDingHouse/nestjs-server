export const ROLE_NAMES = {
  ROOT: 'root',
  ADMIN: 'admin',
  PLAYER: 'player',
} as const;

export type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];
