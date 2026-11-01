# Nakiri Architecture & Engineering Guidelines (`AGENTS.md`)

Dokumen ini adalah pedoman arsitektur dan standar rekayasa software untuk bot **Nakiri (Architecture v2)**. Setiap agen AI dan developer yang berkontribusi pada repositori ini **WAJIB** tunduk pada prinsip di bawah ini tanpa pengecualian.

> [!IMPORTANT]
>
> ### 🚨 Mandatory Directives for AI Agents:
>
> 1. **Panggilan ke Core WAJIB Melalui `@nakiri/core`:**
>    - Jangan pernah menggunakan alias `#` (`#services/...`, `#utils/...`, dll) ataupun path relatif antar-layer (`../../core/...`) untuk modul core.
>    - Semua berkas (baik di dalam `app/`, root `nakiri.js`, maupun antar-berkas di dalam `core/`) **HARUS SELALU** mengimpor dari `@nakiri/core/...`.
> 2. **Pesan Log, Error, dan Deskripsi WAJIB Bahasa Inggris (100% English):**
>    - Seluruh logging (`logger.info`, `logger.warn`, `logger.error`, `logger.debug`), exception error (`throw new Error(...)`), dan atribut `description` modul/command **HARUS menggunakan Bahasa Inggris baku**. DILARANG mencampurkan Bahasa Indonesia pada pesan teknis atau log terminal.
> 3. **Batasan Mutlak Direktori `core/` (Engine Core Boundary):**
>    - Direktori `core/` adalah engine framework internal murni (_agnostic event-driven engine_). **DILARANG KERAS** membuat berkas baru atau mengubah kode di dalam `core/` kecuali jika diperintahkan secara eksplisit oleh pengguna. Seluruh logika aplikasi, bot commands, message gateway, middleware, helper, dan service aplikasi harus diletakkan di dalam folder `app/`.
> 4. **Event Handlers Terorganisir (`app/events/<eventName>/*.js`):**
>    - `app/events/` diorganisir per subfolder event WhatsApp (contoh: `app/events/message/index.js`, `app/events/group/cleanup.js`, `app/events/group/sync.js`).
>    - `app/events/message/index.js` bertindak sebagai message gateway yang memfilter stub/broadcast, mem-parsing `ctx.msg`, menjalankan middleware event, dan mendispatch ke command registry.
>    - Middleware event didaftarkan secara eksplisit dan scoped di `app/starts/kernel.js` (`eventMiddlewares.message`, dll).
> 5. **Command Registry & Parameterized Middleware Guards (`app/services/bot`):**
>    - Seluruh fitur bot diletakkan di `app/commands/<category>/<name>.js` menggunakan `defineCommand` dari `#app/services/bot`.
>    - Guard standar (`'group'`, `'private'`, `'sender:<roles>'`, `'bot:<roles>'`) disediakan bawaan oleh `#app/services/bot`. Tidak perlu mendefinisikan file middleware di `app/middlewares/` untuk guard standar ini!
>    - Validasi hak akses **WAJIB** menggunakan parameterized middlewares di properti `middlewares: [...]` (contoh: `['group', 'sender:admin,superAdmin,isOwner', 'bot:admin']`).
> 6. **Pesan Penolakan Ringkas (Concise Guard Messages):**
>    - Jika terjadi kegagalan validasi hak akses, gunakan pesan penolakan yang ultra-ringkas dan to-the-point (`Only Owner!`, `Only Admin!`, `Only in Group!`, `Bot is not Admin!`). Jangan membanjiri chat WhatsApp dengan pesan penolakan yang panjang dan bertele-tele.
> 7. **DILARANG Auto-Commit Git & DILARANG Suggestion Commit Otomatis:**
>    - AI Agent **DILARANG KERAS** menjalankan perintah `git commit` atau membuat commit secara otomatis (_"biar dev-nya aja yang commit"_).
>    - AI Agent juga **DILARANG** menyertakan rekomendasi/suggestion pesan commit (_suggested Conventional Commit message_) di akhir respons kecuali jika diminta secara eksplisit oleh developer.
> 8. **DILARANG Menambahkan Inisiatif Alias / Bloat Tanpa Izin:**
>    - Jangan pernah berinisiatif membuat alias (fungsi, variabel, atau properti seperti `tableMember`, `getBotSettings`, dll) demi backward compatibility tanpa meminta pendapat/persetujuan developer terlebih dahulu. Buat perubahan langsung, bersih, dan tanpa redundansi untuk menjaga kode tidak gemuk (_no bloat_) dan mudah dimaintain.
> 9. **DILARANG Menggunakan Emoji Slop & Standar Format Pesan Bersih (No Emoji Slop):**
>    - **DILARANG KERAS** menggunakan emoji berlebihan atau emoji hiasan murahan/slop (contoh: ⚙️, 👑, ✅, 🗑️, 💡, 👋, 🚀, dll) dalam respon chat WhatsApp bot.
>    - Format output WhatsApp **WAJIB** rapi, minimalis, dan elegan menyerupai format `menu.js`:
>      - Gunakan header bracket `｢ *title* ｣` atau `*TITLE*`.
>      - Gunakan bullet point simpel `• \`item\`` untuk daftar.
>      - Gunakan monospace backticks untuk perintah atau parameter (`\`prefix add <simbol>\``).
>      - Hindari dekorasi simbol berulang-ulang yang mengotori layar pengguna.
> 10. **Standar Penyimpanan Identitas WhatsApp di Database (Full JID dengan `@`):**
>
> - WhatsApp v2 bekerja dengan dua jenis identitas: **Phone Number (PN)** (`@s.whatsapp.net`) dan **LID** (`@lid`).
> - Seluruh data identitas pengguna yang disimpan ke tabel database (seperti `group_members.user_pn` dan `group_members.user_lid`) **WAJIB menggunakan Full JID lengkap beserta domainnya** (contoh: `628123456789@s.whatsapp.net` untuk PN, dan `198414771982429@lid` untuk LID).
> - **DILARANG** memotong domain `@s.whatsapp.net` atau `@lid` saat menyimpan ke database agar tipe identitas selalu jelas, terbedakan, dan tidak ambigu saat berinteraksi dengan API native Zapo/WhatsApp.
> 10. **Standar Penyimpanan Identitas WhatsApp di Database (Full JID dengan `@`):**
>    - WhatsApp v2 bekerja dengan dua jenis identitas: **Phone Number (PN)** (`@s.whatsapp.net`) dan **LID** (`@lid`).
>    - Seluruh data identitas pengguna yang disimpan ke tabel database (seperti `group_members.user_pn` dan `group_members.user_lid`) **WAJIB menggunakan Full JID lengkap beserta domainnya** (contoh: `628123456789@s.whatsapp.net` untuk PN, dan `198414771982429@lid` untuk LID).
>    - **DILARANG** memotong domain `@s.whatsapp.net` atau `@lid` saat menyimpan ke database agar tipe identitas selalu jelas, terbedakan, dan tidak ambigu saat berinteraksi dengan API native Zapo/WhatsApp.

---

## 1. Filosofi Utama: Architecture v2

1. **Separation of Concerns:**
   - **`core/` (Agnostic Framework Engine):** Hanya menangani koneksi WhatsApp (Zapo), event bus, database (Knex), cache (LRU), environment, modular loader, dan CLI. Bersih dari logika bot perintah teks.
   - **`app/services/bot/` (Bot Engine & Utilities):** Message parser (`parseMessage`), command validator, command registry dengan instant $O(1)$ dispatching, built-in guards (`sender`, `bot`, `group`, `private`), dan formatter menu.
   - **`app/events/message/index.js` (Message Gateway):** Menerima event native `message`, memfilter stub/broadcast, menyiapkan `ctx.msg`, menjalankan middleware event, lalu mendispatch ke command registry.
   - **`app/events/<eventName>/*.js` (Custom Events):** Handler event aplikasi untuk event WhatsApp lainnya (misal sinkronisasi grup).
   - **`app/middlewares/*.js` (App Middlewares):** Middleware logika bisnis spesifik userland (contoh: `bot-table.js`, `group.js`, `group-mode.js`, `group-score.js`).
   - **`app/commands/<category>/*.js` (Commands):** Logika bisnis murni command bot.
2. **Type Safety & Context Extensibility:**
   - Seluruh payload memiliki tipe yang kuat dan scoped.
   - Properti custom pada `ctx` (seperti `ctx.msg`, `ctx.tableBot`, `ctx.tableGroup`, `ctx.tableGroupMember`) didefinisikan di `app/types/context.d.ts` menggunakan TypeScript module augmentation.

---

## 2. Struktur Direktori Aplikasi (`app/`)

```text
nakiri/
├── core/                         # Engine & Framework (@nakiri/core package - Pure Agnostic)
│   ├── services/                 # Core engine (whatsapp, database, env, modules, cli, starts, cache)
│   └── utils/                    # Pure helpers (logger, path, storage, common, dll)
├── app/                          # Userland Application Logic
│   ├── types/                    # Userland Context Augmentation
│   │   └── context.d.ts          # ctx.msg, ctx.tableBot, ctx.tableGroup, ctx.tableGroupMember
│   ├── starts/                   # Application startup lifecycle
│   │   ├── index.js              # AdonisJS-style application hooks (app.use, app.server, app.terminal)
│   │   └── kernel.js             # Userland event middlewares & custom command middleware aliases
│   ├── middlewares/              # Userland middlewares
│   │   ├── bot-table.js          # Inject ctx.tableBot from database/cache
│   │   ├── bot-ignore.js         # Filter stubs, broadcasts, & parse ctx.msg
│   │   ├── group.js              # Group & member records (ctx.tableGroup, ctx.tableGroupMember)
│   │   ├── group-mode.js         # Group botAccess policy guard ('everyone' vs 'admin')
│   │   ├── group-score.js        # Debounced group member interaction scoring
│   │   └── bot-guards.js         # Command guards (sender, bot, group, private)
│   ├── events/                   # Dedicated Native Event Subdirectories
│   │   ├── message/
│   │   │   └── commands.js       # WhatsApp message command dispatcher
│   │   └── group/
│   │       ├── cleanup-database.js Purge records on bot departure or member kick
│   │       └── sync-cache.js     Invalidate and refresh group metadata cache
│   ├── commands/                 # Declarative Bot Commands
│   │   ├── group/                # Group management commands (kick, warn, randkick, board, botaccess)
│   │   ├── owner/                # Owner commands (eval, exec, leave, owner)
│   │   └── utility/              # Utility commands (ping, menu)
│   ├── services/                 # Shared business logic & bot engine
│   │   ├── bot/                  # Bot service (command registry, message parser, menu builder, runner)
│   │   └── owner.js              # Owner management service
│   └── database/                 # Migrations & Seeds
├── storage/                      # SQLite DB, session WhatsApp, temp storage
├── nakiri.js                     # Centralized Nakiri CLI runner
└── AGENTS.md                     # This document
```

---

## 3. Konvensi Import Alias

1. **Memanggil Core:**
   - **WAJIB** menggunakan package specifier `@nakiri/core/...`.
   - ✅ `import logger from '@nakiri/core/utils/logger';`
   - ✅ `import db from '@nakiri/core/services/database';`
   - ✅ `import cache from '@nakiri/core/services/cache';`
   - ✅ `import { defineModule } from '@nakiri/core/services/modules';`
2. **Memanggil App Modules:**
   - Gunakan Subpath Import `#app/...`.
   - ✅ `import { defineCommand } from '#app/services/bot/index.js';`
   - ✅ `import { getGroupMetadata, clearGroupMetadataCache } from '#app/services/bot/index.js';`
   - ✅ `import { checkOwnerAccess } from '#app/services/owner.js';`

---

## 4. Kernel & Middleware Pipeline (`app/starts/kernel.js`)

Userland middleware didaftarkan secara deklaratif di `app/starts/kernel.js`:

```javascript
// app/starts/kernel.js
export const eventMiddlewares = {
  message: [
    () => import('#app/middlewares/bot-table.js'),
    () => import('#app/middlewares/bot-ignore.js'),
    () => import('#app/middlewares/group.js'),
    () => import('#app/middlewares/group-mode.js'),
    () => import('#app/middlewares/group-score.js'),
  ],
}

/**
 * Command middleware aliases mapped to app/middlewares/bot-guards.js
 */
export const middlewareAliases = {
  sender: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.senderGuard),
  bot: () => import('#app/middlewares/bot-guards.js').then((m) => m.botGuard),
  group: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.groupOnlyGuard),
  private: () =>
    import('#app/middlewares/bot-guards.js').then((m) => m.privateOnlyGuard),
}
```

---

## 5. Standar Menulis Bot Command (`app/commands/<category>/<name>.js`)

Gunakan fungsi `defineCommand` yang mengekspor objek definisi perintah:

```javascript
// app/commands/group/kick.js
import { defineCommand } from '#app/services/bot/index.js'

export default defineCommand({
  name: 'kick',
  aliases: ['kick'],
  category: 'group',
  description: 'Kick group member by tag or reply',

  // Parameterized middleware guards (auto-resolved by bot service):
  middlewares: ['group', 'sender:admin,superAdmin', 'bot:admin'],

  async execute(payload, ctx) {
    const { client, msg } = ctx

    // Command logic goes here!
    // No need for manual isCommand() or permission checking.
    await msg.reply('Target removed successfully.')
  },
})
```

### Opsi Definisi Command:

- **`name`** (string): Nama unik pengenal modul/perintah (contoh: `'kick'`, `'ping'`). Hanya sebagai unique identifier metadata, **BUKAN trigger command**.
- **`aliases`** (string[]): Daftar trigger command yang dapat dieksekusi pengguna di WhatsApp (contoh: `['kick']`, `['ping']`, `['menu', 'help']`, `['>', '>>']`).
- **`category`** (string): Kategori perintah untuk pengelompokan menu (contoh: `'group'`, `'utility'`, `'owner'`).
- **`description`** (string): Deskripsi ringkas dalam Bahasa Inggris baku.
- **`middlewares`** (string[]): Daftar guard middleware (contoh: `['group', 'sender:isOwner']`).
- **`prefix`** (`boolean | 'optional'`):
  - `true` (default): Wajib diawali prefix bot.
  - `false`: Dilarang menggunakan prefix (contoh: `>`, `$`).
  - `'optional'`: Dapat dieksekusi dengan atau tanpa prefix.
- **`execute`** (`(payload, ctx) => Promise<void>`): Handler fungsi eksekusi perintah.

---

## 6. Built-in Parameterized Middleware Guards

Bot service framework secara otomatis menyediakan 4 guard bawaan:

1. **`sender:<role1>,<role2>`**:
   - Memastikan pengirim memiliki setidaknya salah satu peran yang diminta (`admin`, `superAdmin`, `isOwner`).
   - Contoh: `'sender:isOwner'`, `'sender:admin,superAdmin'`, `'sender:admin,superAdmin,isOwner'`.
   - Pesan penolakan otomatis: `'Only Owner!'` (jika hanya owner) atau `'Only Admin!'`.
2. **`bot:<role>`**:
   - Memastikan bot memiliki hak akses (`bot:admin`).
   - Pesan penolakan otomatis: `'Bot is not Admin!'`.
3. **`group`**:
   - Memastikan perintah dieksekusi di dalam grup WhatsApp.
   - Pesan penolakan otomatis: `'Only in Group!'`.
4. **`private`**:
   - Memastikan perintah dieksekusi di chat pribadi (bukan grup).
   - Pesan penolakan otomatis: `'Only in Private Chat!'`.

---

## 7. Standar Logging & Error Handling (100% English)

- Semua log terminal, pesan exception, dan komentar kode **WAJIB Bahasa Inggris**:
  - ✅ `logger.info('[REGISTRY]', 'Loaded 11 commands');`
  - ✅ `throw new Error('Chat JID is required');`
  - ❌ `logger.info('[BOT]', 'Memuat perintah bot');` (DILARANG!)
