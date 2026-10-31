export class WhatsAppEventBus {
  listeners = new Map();

  constructor() {
    this.on = this.createSubscriber(false);
    this.once = this.createSubscriber(true);
    this.off = this.createUnsubscriber();
  }

  createSubscriber(isOnce) {
    const fn = (event, callback) => {
      return isOnce
        ? this.addOnceListener(event, callback)
        : this.addListener(event, callback);
    };

    return new Proxy(fn, {
      get: (_target, prop) => {
        if (typeof prop !== 'string') return undefined;
        return (callback) => {
          return isOnce
            ? this.addOnceListener(prop, callback)
            : this.addListener(prop, callback);
        };
      },
    });
  }

  createUnsubscriber() {
    const fn = (event, callback) => {
      this.removeListener(event, callback);
    };

    return new Proxy(fn, {
      get: (_target, prop) => {
        if (typeof prop !== 'string') return undefined;
        return (callback) => {
          this.removeListener(prop, callback);
        };
      },
    });
  }

  addListener(event, callback) {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(callback);
    return () => this.removeListener(event, callback);
  }

  addOnceListener(event, callback) {
    const wrapper = (...args) => {
      this.removeListener(event, wrapper);
      return callback(...args);
    };
    wrapper._original = callback;
    return this.addListener(event, wrapper);
  }

  removeListener(event, callback) {
    const set = this.listeners.get(event);
    if (!set) return;

    for (const item of set) {
      if (item === callback || item._original === callback) {
        set.delete(item);
      }
    }

    if (set.size === 0) {
      this.listeners.delete(event);
    }
  }

  emit(event, ...args) {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;

    const listenersSnapshot = Array.from(set);

    for (const listener of listenersSnapshot) {
      try {
        const result = listener(...args);
        if (result && typeof result.catch === 'function') {
          result.catch((err) => {
            console.error(
              `[WhatsAppEventBus] Unhandled error in async listener for "${event}":`,
              err
            );
          });
        }
      } catch (err) {
        console.error(
          `[WhatsAppEventBus] Error in listener for "${event}":`,
          err
        );
      }
    }
  }

  emitQr(sessionId, qr) {
    this.emit('qr', sessionId, qr);
  }

  emitStatus(sessionId, status) {
    this.emit('status', sessionId, status);
  }

  emitMessage(event, sessionId, client) {
    this.emit('message', event, sessionId, client);
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

export default WhatsAppEventBus;
