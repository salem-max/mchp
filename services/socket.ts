/**
 * Lightweight native WebSocket wrapper that exposes a Socket.IO-like API.
 * No socket.io-client dependency — uses the browser's built-in WebSocket.
 */

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";

type EventHandler = (...args: any[]) => void;

class NativeSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private oneTimeHandlers: Map<string, EventHandler[]> = new Map();
  public connected = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.shouldReconnect = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.connected = true;
        this._emit("connect");
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event && typeof payload.event === "string") {
            this._emit(payload.event, payload.data);
          }
        } catch {
          // Non-JSON messages ignored
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this._emit("disconnect");
        if (this.shouldReconnect) {
          this.reconnectTimer = setTimeout(() => this.connect(), 3000);
        }
      };

      this.ws.onerror = () => {
        // Errors surface via onclose + reconnect logic
      };
    } catch {
      // If connection fails immediately, schedule reconnect
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  on(event: string, handler: EventHandler) {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.handlers.delete(event);
      this.oneTimeHandlers.delete(event);
      return;
    }
    const list = this.handlers.get(event);
    if (list) {
      this.handlers.set(
        event,
        list.filter((h) => h !== handler)
      );
    }
    const onceList = this.oneTimeHandlers.get(event);
    if (onceList) {
      this.oneTimeHandlers.set(
        event,
        onceList.filter((h) => h !== handler)
      );
    }
  }

  once(event: string, handler: EventHandler) {
    const list = this.oneTimeHandlers.get(event) || [];
    list.push(handler);
    this.oneTimeHandlers.set(event, list);
  }

  emit(event: string, ...args: any[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify({ event, data: args.length === 1 ? args[0] : args }));
  }

  private _emit(event: string, ...args: any[]) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach((h) => {
      try {
        h(...args);
      } catch (e) {
        // swallow handler errors to keep socket alive
      }
    });

    const onceHandlers = this.oneTimeHandlers.get(event) || [];
    if (onceHandlers.length > 0) {
      onceHandlers.forEach((h) => {
        try {
          h(...args);
        } catch (e) {
          // swallow
        }
      });
      this.oneTimeHandlers.delete(event);
    }
  }
}

export const socket = new NativeSocket();

export default socket;

