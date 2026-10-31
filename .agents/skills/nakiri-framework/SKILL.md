---
name: nakiri-framework
description: Engineering rules, architectural guidelines, code patterns, and best practices for developing WhatsApp bot features, commands, middlewares, and events in the Nakiri framework.
---

# Nakiri Framework Development Guide (Architecture v2)

Use this skill whenever authoring, reviewing, modifying, or refactoring any code in the **Nakiri** WhatsApp bot project.

---

## 1. Core Architectural Pillars

Nakiri Architecture v2 separates concerns into clean, decoupled layers:

1. **Native Event Gateways (`app/events/<eventName>.js`)**:
   - Exactly one gateway file per WhatsApp event (`message.js`, `group.js`, etc.).
   - Executes event middlewares mapped in `app/starts/kernel.js`.
   - Delegates incoming messages to `dispatchCommand` in `app/services/bot/registry.js`.
2. **Explicit Event Middlewares (`app/starts/kernel.js`)**:
   - No omnivorous global middlewares that receive arbitrary event payloads.
   - Middlewares are scoped explicitly per event channel (e.g. `eventMiddlewares.message`).
3. **Flat Middleware Pool (`app/middlewares/*.js`)**:
   - Flat directory holding reusable middleware handlers.
   - Used either as event-level pre-filters or command-level guards.
4. **Declarative Commands (`app/commands/<category>/<name>.js`)**:
   - Defined via `defineCommand({ ... })` from `#app/services/bot/index.js`.
   - Contains pure business logic.
   - Access control is declared via `middlewares: [...]`.
5. **Instant Command Registry (`#app/services/bot`)**:
   - Auto-discovers all commands in `app/commands/**/*.js`.
   - Populates an $O(1)$ trigger map with aliases.
   - Automatically executes parameterized middleware rules before calling `execute()`.
6. **Solid Typing & Context Augmentation (`app/types/`)**:
   - `context.d.ts`, `middleware.d.ts`, `command.d.ts`.
   - Type-safe `ctx` with module augmentation.

---

## 2. Hard Directives for AI Agents

1. **Importing Core**:
   - **MUST ALWAYS** use `@nakiri/core/...` package specifier (e.g., `import db from '@nakiri/core/services/database'`, `import { defineModule } from '@nakiri/core/services/modules'`).
   - ❌ Never use `#services/...`, `#utils/...`, or relative paths (`../../core/...`).
2. **Importing Userland Modules**:
   - Use `#app/...` subpath imports (e.g., `import { runEventMiddlewares } from '#app/starts/kernel.js'`).
3. **English Standard (100% English)**:
   - All code comments, docstrings, logger calls (`logger.info`, `logger.error`), error exceptions, and module/command descriptions **MUST be in English**.
4. **Boundary of `core/`**:
   - Never create or edit files in `core/` unless explicitly instructed by the user. All userland logic belongs strictly in `app/`.
5. **Concise Guard Rejections**:
   - Access control rejections must be ultra-concise: `'Only Owner!'`, `'Only Admin!'`, `'Only in Group!'`, `'Bot is not Admin!'`.
6. **No Automated Git Commits & No Commit Suggestions**:
   - AI agents are **STRICTLY FORBIDDEN** from executing `git commit` or committing changes automatically.
   - AI agents are also **FORBIDDEN** from appending commit suggestions (_suggested Conventional Commit messages_) at the end of responses unless explicitly requested by the developer.
7. **No Unapproved Aliases or Compatibility Bloat**:
   - Never add backward-compatibility aliases (functions, variables, or properties like `tableMember`, `getBotSettings`) without asking and receiving approval from the developer first. Keep the codebase clean, lean, and maintainable.

---

## 3. How to Create a Bot Command

Create a new file in `app/commands/<category>/<name>.js`:

```javascript
// app/commands/utility/ping.js
import os from 'os'
import { defineCommand } from '@nakiri/core/services/commands'

export default defineCommand({
  name: 'ping',
  aliases: ['ping', 'speed'],
  category: 'utility',
  description: 'Check bot responsiveness and server latency',
  prefix: 'optional', // 'optional', true (default), or false

  // Declarative guards (parameterized middlewares):
  middlewares: [],

  async execute(payload, ctx) {
    const { msg } = ctx
    await msg.reply('Pong!')
  },
})
```

### Parameterized Middleware Guards

Use string notation in the `middlewares` array:

- **`'group'`**: Requires message to be from a WhatsApp group chat.
- **`'private'`**: Requires message to be from a private 1:1 chat.
- **`'sender:<roles>'`**: Requires sender to have at least one of the listed roles:
  - `'sender:isOwner'`: Bot owner only.
  - `'sender:admin'`: Group admin or superadmin.
  - `'sender:admin,superAdmin,isOwner'`: Admin, superadmin, or bot owner.
- **`'bot:<roles>'`**: Requires bot to have the specified role (e.g. `'bot:admin'`).

Example with multiple guards:

```javascript
// app/commands/group/kick.js
export default defineCommand({
  name: 'kick',
  category: 'group',
  description: 'Kick a member from the group',
  middlewares: ['group', 'sender:admin,superAdmin', 'bot:admin'],

  async execute(payload, ctx) {
    const { client, msg } = ctx
    // Execution is guaranteed to have passed all guards!
  },
})
```

---

## 4. How to Create a Middleware

Create a handler in `app/middlewares/<name>.js`:

```javascript
// app/middlewares/vip_only.js
/**
 * @type {import('@nakiri/core/services/commands').CommandMiddlewareHandler}
 */
export default async function vipOnlyMiddleware(payload, ctx, args = []) {
  const isVip = ctx.tableGroupMember?.is_vip
  if (!isVip) {
    await ctx.msg.reply('Only VIP Members!')
    return false // Return false or call ctx.stop() to abort command execution
  }
  return true
}
```

Register the alias in `app/starts/kernel.js`:

```javascript
export const middlewareAliases = {
  // ...
  vip: () => import('#app/middlewares/vip_only.js'),
}
```

Now any command can use it:

```javascript
middlewares: ['vip']
```

---

## 5. How to Add Event Handlers

Events are organized into subdirectories per WhatsApp event channel (`app/events/<eventName>/`):

```javascript
// app/events/call/index.js
import { defineModule } from '@nakiri/core/services/modules'
import { runEventMiddlewares } from '#app/starts/kernel.js'

export default defineModule({
  name: 'call-gateway',
  event: 'call',
  level: 10,
  category: 'call',
  description: 'Native WhatsApp call event handler',

  async execute(payload, ctx) {
    await runEventMiddlewares('call', payload, ctx)
  },
})
```

Add any scoped middlewares for `call` in `app/starts/kernel.js`:

```javascript
export const eventMiddlewares = {
  // ...
  call: [() => import('#app/middlewares/reject_call.js')],
}
```

---

## 6. How to Extend Context Types

To inject custom properties into `ctx` (e.g. `ctx.session`, `ctx.vipData`), edit `app/types/context.d.ts`:

```typescript
// app/types/context.d.ts
export interface CustomContextData {
  tableBot?: any
  tableGroup?: any
  tableGroupMember?: any
  vipData?: { tier: number } // Added custom property
  [key: string]: any
}
```

TypeScript and IDE Language Servers will immediately provide full type autocompletion across all event handlers, middlewares, and commands.
