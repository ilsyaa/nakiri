import logger from '@nakiri/core/utils/logger';

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch (e) {
    return false;
  }
}

export async function retry(fn, retries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(
        `[RETRY] Attempt ${i + 1}/${retries} failed. Retrying in ${delayMs}ms...`
      );

      if (i < retries - 1) {
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

export function getRandomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray(arr) {
  const result = [...arr];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function toArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function pluckProperty(arr, key) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => item?.[key]);
}

export function chunkArray(arr, size) {
  if (!Array.isArray(arr) || size <= 0) return [];
  const result = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}

export function interpolateString(str, params = {}) {
  return str.replace(/{(\w+)}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

export function getRandomString(length = 16) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function toSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function toCamelCase(text) {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

export function toKebabCase(text) {
  const match = text.match(
    /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
  );

  return match ? match.map((x) => x.toLowerCase()).join('-') : '';
}

export function truncateText(text, length = 100, end = '...') {
  return text.length > length ? text.substring(0, length) + end : text;
}

export function toTitleCase(text) {
  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function ucfirst(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function maskPhoneNumber(phone) {
  if (!phone) return '';
  const number = phone.split('@')[0].replace(/\D/g, '');

  if (number.length <= 6) return phone;
  return number.substring(0, 5) + '****' + number.substring(number.length - 4);
}

export function formatNumber(value, locale = 'id-ID') {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(value, curr = 'IDR', locale = 'id-ID') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getRandomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);

  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function isNumeric(value) {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
  if (typeof value === 'string') {
    if (value.trim() === '') return false;
    return !isNaN(Number(value)) && isFinite(Number(value));
  }
  return false;
}

export function setNestedValue(target, path, value, position = null) {
  const parts = path.split('.');
  const lastKey = parts.pop();
  let current = target;

  for (const part of parts) {
    current = current[part] ??= {};
  }

  current[lastKey] = value;

  if (position === null || position === undefined) return;

  const keys = Object.keys(current);
  const curIndex = keys.indexOf(lastKey);

  if (curIndex === -1) return;
  if (curIndex === position) return;

  keys.splice(curIndex, 1);
  keys.splice(position, 0, lastKey);

  const snapshot = {};
  for (const k of keys) snapshot[k] = current[k];
  for (const k in current) {
    delete current[k];
  }

  Object.assign(current, snapshot);
}

export function getNestedValue(target, path) {
  if (!target || !path) return undefined;

  const parts = path.split('.');
  let current = target;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

export function pick(obj, keys) {
  const result = {};

  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
}

export function omit(obj, keys) {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}

export default {
  delay,
  isUrl,
  retry,
  getRandomItem,
  shuffleArray,
  toArray,
  pluckProperty,
  chunkArray,
  interpolateString,
  getRandomString,
  toSlug,
  toCamelCase,
  toKebabCase,
  truncateText,
  toTitleCase,
  ucfirst,
  escapeRegExp,
  maskPhoneNumber,
  formatNumber,
  formatCurrency,
  formatFileSize,
  getRandomInt,
  isNumeric,
  setNestedValue,
  getNestedValue,
  pick,
  omit,
};
