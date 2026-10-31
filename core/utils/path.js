import path from 'path';
import fs from 'fs';

const ROOT = process.cwd();

const joinPath = (base, subPath = '') => {
  return path.join(base, subPath);
};

export const dirRoot = (...subs) => path.join(ROOT, ...subs);
export const dirCore = (...subs) => path.join(ROOT, 'core', ...subs);
export const dirApp = (...subs) => path.join(ROOT, 'app', ...subs);
export const dirEvents = (...subs) => path.join(ROOT, 'app', 'events', ...subs);
export const dirStarts = (...subs) => path.join(ROOT, 'app', 'starts', ...subs);
export const dirStorage = (...subs) => path.join(ROOT, 'storage', ...subs);
export const dirTemp = (...subs) => path.join(ROOT, 'storage', 'tmp', ...subs);

export const initDirectories = () => {
  const essentialDirs = [
    dirStorage(),
    dirTemp(),
    dirApp(),
    dirEvents(),
    dirStarts(),
    dirApp('database/migrations'),
    dirApp('database/seeds'),
    dirApp('services'),
  ];

  essentialDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

export default {
  dirRoot,
  dirCore,
  dirApp,
  dirEvents,
  dirStarts,
  dirStorage,
  dirTemp,
  initDirectories,
};
