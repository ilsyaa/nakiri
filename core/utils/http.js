import path from 'path';

export class HttpResponse {
  rawResponse;

  constructor(rawResponse) {
    this.rawResponse = rawResponse;
  }

  ok() {
    return this.rawResponse.ok;
  }

  status() {
    return this.rawResponse.status;
  }

  headers() {
    return this.rawResponse.headers;
  }

  async json() {
    return await this.rawResponse.json();
  }

  async text() {
    return this.rawResponse.text();
  }

  async arrayBuffer() {
    return this.rawResponse.arrayBuffer();
  }

  get raw() {
    return this.rawResponse;
  }
}

export class PendingRequest {
  requestHeaders = {};
  timeoutMs = null;

  withHeaders(headers) {
    this.requestHeaders = { ...this.requestHeaders, ...headers };
    return this;
  }

  withToken(token, type = 'Bearer') {
    this.requestHeaders['Authorization'] = `${type} ${token}`;
    return this;
  }

  accept(contentType) {
    this.requestHeaders['Accept'] = contentType;
    return this;
  }

  acceptJson() {
    return this.accept('application/json');
  }

  timeout(ms) {
    this.timeoutMs = ms;
    return this;
  }

  async send(method, url, data) {
    const options = {
      method,
      headers: { ...this.requestHeaders },
    };

    if (data) {
      if (
        typeof data === 'object' &&
        !(data instanceof FormData) &&
        !(data instanceof URLSearchParams)
      ) {
        options.headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        options.body = JSON.stringify(data);
      } else {
        options.body = data;
      }
    }

    let controller;
    let timeoutId;

    if (this.timeoutMs !== null) {
      controller = new AbortController();
      options.signal = controller.signal;
      timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    }

    try {
      const response = await fetch(url, options);
      return new HttpResponse(response);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(
          `HTTP ${method} Request to ${url} timed out after ${this.timeoutMs}ms`
        );
      }
      throw new Error(
        `HTTP ${method} Request failed: ${err?.message || 'Unknown error'}`
      );
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  async get(url, query) {
    let finalUrl = url;

    if (query) {
      /** @type {Record<string, string>} */
      const stringQuery = {};
      for (const [key, val] of Object.entries(query)) {
        if (val !== undefined && val !== null) {
          stringQuery[key] = String(val);
        }
      }
      const searchParams = new URLSearchParams(stringQuery);
      const separator = url.includes('?') ? '&' : '?';
      finalUrl = `${url}${separator}${searchParams.toString()}`;
    }

    return this.send('GET', finalUrl);
  }

  async post(url, data) {
    return this.send('POST', url, data);
  }

  async put(url, data) {
    return this.send('PUT', url, data);
  }

  async delete(url, data) {
    return this.send('DELETE', url, data);
  }
}

export class Http {
  static withHeaders(headers) {
    return new PendingRequest().withHeaders(headers);
  }

  static withToken(token, type = 'Bearer') {
    return new PendingRequest().withToken(token, type);
  }

  static accept(contentType) {
    return new PendingRequest().accept(contentType);
  }

  static acceptJson() {
    return new PendingRequest().acceptJson();
  }

  static timeout(ms) {
    return new PendingRequest().timeout(ms);
  }

  static async get(url, query) {
    return new PendingRequest().get(url, query);
  }

  static async post(url, data) {
    return new PendingRequest().post(url, data);
  }

  static async put(url, data) {
    return new PendingRequest().put(url, data);
  }

  static async delete(url, data) {
    return new PendingRequest().delete(url, data);
  }

  static async getFromUrl(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mime =
        response.headers.get('content-type') || 'application/octet-stream';
      const size = buffer.length;

      let filename = 'file';
      const contentDisposition = response.headers.get('content-disposition');

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      } else {
        try {
          const parsedUrl = new URL(url);
          const pathname = parsedUrl.pathname;
          filename = path.basename(pathname) || 'file';
        } catch {}
      }

      let ext = path.extname(filename).replace('.', '');
      if (!ext) {
        if (mime.includes('image/jpeg')) ext = 'jpg';
        else if (mime.includes('image/png')) ext = 'png';
        else if (mime.includes('image/webp')) ext = 'webp';
        else if (mime.includes('image/gif')) ext = 'gif';
        else if (mime.includes('video/mp4')) ext = 'mp4';
        else if (mime.includes('application/pdf')) ext = 'pdf';
        else ext = 'bin';

        if (filename === 'file') {
          filename = `file.${ext}`;
        }
      }

      return {
        buffer,
        mime,
        ext,
        size,
        filename,
      };
    } catch {
      return null;
    }
  }
}

export default Http;
