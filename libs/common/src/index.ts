export * from './database/database.module';
export * from './database/abstract.repository';
export * from './database/abstract.schema';
export * from './database/schemas/user.schema';
export * from './database/repositories/user.repository';
export * from './database/schemas/role.schema';
export * from './database/repositories/role.repository';

// nestjs-server/
// ├── libs/
// │   └── common/
// │       ├── src/
// │       │   ├── database/
// │       │   │   ├── database.module.ts
// │       │   │   ├── abstract.repository.ts
// │       │   │   ├── abstract.schema.ts
// │       │   ├── index.ts
// │       ├── tsconfig.json
// │       └── package.json
// ├── apps/
// │   └── api/
// │   |   ├── src/
// │   |   │   ├── users/
// │   |   │   │   ├── users.module.ts
// │   |   │   │   ├── users.service.ts
// │   |   │   │   └── users.controller.ts
// │   |   │   ├── main.ts
// |   |   |   ├──api.service.ts
// |   |   |   ├──api.module.ts
// |   |   |   ├──api.controller.ts
// │   |   ├── tsconfig.app.json
// │   |   └── package.json
// │   └── realtime/
// │       ├── src/
// │       │   ├── main.ts
// |       |   ├──realtime.service.ts
// |       |   ├──realtim.module.ts
// |       |   ├──realtime.controller.ts
// │       ├── tsconfig.app.json
// │       └── package.json
// ├── tsconfig.json
// └── package.json
