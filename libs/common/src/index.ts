export * from './database/database.module';
export * from './database/abstract.repository';
export * from './database/abstract.schema';
export * from './database/schemas/user.schema';
export * from './database/repositories/user.repository';
export * from './database/schemas/role.schema';
export * from './database/repositories/role.repository';
export * from './constants/roles';
export * from './constants/status';
export * from './dto/pagination-result.dto';
export * from './pipes/parse-object-id.pipe';

// nestjs-server/
// ├── libs/
// │   └── common/
// │       ├── src/
// │       │   ├── constants/
// │       │   │   ├── roles.ts
// │       │   │   ├── status.ts
// │       │   ├── database/
// │       │   │   ├── repositories/
// │       │   │   │   ├── role.repository.ts
// │       │   │   ├── schemas/
// │       │   │   │   ├── role.schema.ts
// │       │   │   ├── database.module.ts
// │       │   │   ├── abstract.repository.ts
// │       │   │   ├── abstract.schema.ts
// │       │   ├── dto/
// │       │   │   ├── pagination-result.dto.ts
// │       │   ├── pipes/
// │       │   │   ├── parse-object-id.pipe.ts
// │       │   ├── types/
// │       │   │   ├── lean-document.ts
// │       │   ├── index.ts
// │       ├── tsconfig.json
// │       └── package.json
// ├── apps/
// │   └── api/
// │   |   ├── src/
// │   |   │   ├── roles/
// │   |   │   │   ├──dto/
// │   |   │   │   │   ├── create-role.dto.ts
// │   |   │   │   │   ├── update-role.dto.ts
// │   |   │   │   │   ├── find-all-role.dto.ts
// │   |   │   │   ├── roles.config.ts
// │   |   │   │   ├── roles.module.ts
// │   |   │   │   ├── roles.service.ts
// │   |   │   │   └── roles.controller.ts
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
