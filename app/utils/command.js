const { default: consola } = require('consola');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const commands = new Map();
const commandIndex = new Map();
const tags = new Map();
const dirCommands = path.join(__dirname, '../bot/commands/');

module.exports = {
  Command: function (options) {
    let { name, run, alias, ...opt } = options;

    name = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .trim();
    run =
      run ||
      async function () {
        console.log(`[COMMANDS] No run function for command ${name}`);
      };

    if (commands.has(name))
      return consola.warn(
        `[COMMANDS] Duplicate command name ${name} is already registered!`
      );
    if (!Array.isArray(alias))
      return consola.warn(
        `[COMMANDS] Command ${name} must define an alias array (e.g., alias: ['menu', 'help']).`
      );
    if (typeof run !== 'function')
      return consola.warn(
        `[COMMANDS] Command ${name} must have a valid 'run' function.`
      );

    const error = new Error();
    const stackLine = error.stack.split('\n')[2];
    const match = stackLine.match(/\((.*):\d+:\d+\)$/);
    const filepath = match ? match[1] : 'unknown';

    for (const as of alias) {
      if (commandIndex.has(as)) {
        commandIndex.set(as, [...commandIndex.get(as), name]);
      } else {
        commandIndex.set(as, [name]);
      }
    }

    if (opt?.tags) {
      const { label, example } = opt.tags;
      if (!tags.has(label)) {
        tags.set(label, []);
      }

      tags.get(label).push({
        alias,
        example,
      });
    }

    commands.set(name, {
      name: name,
      alias: alias,
      options: { ...opt, alias },
      run: run,
      filepath: filepath,
    });
  },

  initCommands: async () => {
    // eslint-disable-next-line no-unused-vars
    let totalFiles = 0;

    const loadFile = file => {
      totalFiles++;
      try {
        delete require.cache[require.resolve(file)];
        require(file);
      } catch (e) {
        consola.error(`[COMMANDS] Failed to load ${file}:`, e.message);
      }
    };

    const loadDirectory = dirPath => {
      fs.readdirSync(dirPath).forEach(dirOrFile => {
        const dirOrFilePath = path.join(dirPath, dirOrFile);
        try {
          const stat = fs.lstatSync(dirOrFilePath);
          if (stat.isSymbolicLink()) return;

          if (stat.isDirectory()) {
            loadDirectory(dirOrFilePath);
          } else if (dirOrFile.endsWith('.js')) {
            loadFile(dirOrFilePath);
          }
        } catch (err) {
          consola.error(
            `[COMMANDS] Failed to read ${dirOrFilePath}:`,
            err.message
          );
        }
      });
    };

    const refreshCommands = () => {
      commands.clear();
      commandIndex.clear();
      tags.clear();

      Object.keys(require.cache).forEach(key => {
        if (key.includes(path.join(__dirname, '../bot/commands/'))) {
          delete require.cache[key];
        }
      });

      loadDirectory(dirCommands);
    };

    loadDirectory(dirCommands);
    consola.info(`[COMMANDS] Loaded ${commands.size} commands.`);

    const watcher = chokidar.watch(dirCommands, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
    });

    watcher.on('add', filePath => {
      if (filePath.endsWith('.js')) {
        consola.info(`[COMMANDS] New file detected: ${filePath}`);
        loadFile(filePath);
      }
    });

    watcher.on('change', filePath => {
      if (filePath.endsWith('.js')) {
        consola.info(`[COMMANDS] File changed: ${filePath}`);
        refreshCommands();
      }
    });

    watcher.on('unlink', filePath => {
      if (filePath.endsWith('.js')) {
        consola.info(`[COMMANDS] File deleted: ${filePath}`);
        refreshCommands();
      }
    });
  },

  getAliases: name => {
    let cmds = [];
    const alias = commandIndex.get(name);
    if (!alias) return [];
    for (const name of alias) {
      const a = commands.get(name);
      if (!a) continue;
      cmds = [...cmds, a];
    }
    return cmds;
  },

  tags,
  commands,
  commandIndex,
};
