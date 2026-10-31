import { formatWithOptions } from 'node:util';
import pc from 'picocolors';

const themes = {
  INFO: { color: pc.cyanBright, label: 'INFO' },
  WARN: { color: pc.yellowBright, label: 'WARN' },
  ERROR: { color: pc.redBright, label: 'ERROR' },
  SUCCESS: { color: pc.greenBright, label: 'DONE' },
  READY: { color: pc.magentaBright, label: 'READY' },
  DEBUG: { color: pc.blueBright, label: 'DEBUG' },
  FATAL: { color: pc.redBright, label: 'FATAL' },
};

function getTimestamp() {
  const now = new Date();
  const pad = (n, len = 2) => n.toString().padStart(len, '0');
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return `${HH}:${mm}:${ss}`;
}

function renderLog(type, args, loggerFn = console.log) {
  const theme = themes[type];
  let messageArgs = [...args];
  const prefixes = [];

  while (
    typeof messageArgs[0] === 'string' &&
    /^\[.*?\]$/.test(messageArgs[0])
  ) {
    prefixes.push(messageArgs.shift());
  }

  if (messageArgs.length === 0) {
    messageArgs.push('');
  }

  const rawMessage = formatWithOptions(
    { colors: true, depth: null },
    ...messageArgs
  );

  const lines = rawMessage.split('\n');
  const timeBlock = pc.magentaBright(getTimestamp());
  const paddedLabel = theme.label.padEnd(5, ' ');
  const labelBlock = theme.color(paddedLabel);
  const colon = pc.white('');
  const prefixStr = prefixes.length ? pc.gray(prefixes.join(' ')) + ' ' : '';
  const firstLineOutput = `${timeBlock} ${labelBlock}${colon} ${prefixStr}${pc.white(lines[0])}`;
  const subsequentLines = lines.slice(1);
  const finalOutput = [firstLineOutput, ...subsequentLines].join('\n');

  loggerFn(finalOutput);
}

export default {
  info: (...args) => renderLog('INFO', args),
  warn: (...args) => renderLog('WARN', args, console.warn),
  error: (...args) => renderLog('ERROR', args, console.error),
  success: (...args) => renderLog('SUCCESS', args),
  ready: (...args) => renderLog('READY', args),
  debug: (...args) => renderLog('DEBUG', args, console.debug),
  fatal: (...args) => renderLog('FATAL', args, console.error),
};
