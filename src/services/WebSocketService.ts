
// Configuration du service WebSocket
const WS_URL = 'wss://api.pronosbox.com/ws';
const RECONNECT_INTERVAL = 5000;

// Types d'événements supportés
export const WS_EVENTS = {
  // Événements utilisateur
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  USER_TYPING: 'user:typing',

  // Événements de canal
  CHANNEL_NEW_MESSAGE: 'channel:new_message',
  CHANNEL_UPDATE: 'channel:update',
  CHANNEL_NEW: 'channel:new',
  CHANNEL_DELETE: 'channel:delete',

  // Événements d'administration
  ADMIN_USER_UPDATED: 'admin:user_updated',
  ADMIN_WITHDRAWAL_REQUEST: 'admin:withdrawal_request',
  ADMIN_NEW_SUPPORT_MESSAGE: 'admin:new_support_message',

  // Événements de transaction
  TRANSACTION_COMPLETE: 'transaction:complete',
  TRANSACTION_FAILED: 'transaction:failed'
} as const;

export type WSEventType = typeof WS_EVENTS[keyof typeof WS_EVENTS] | '*';

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
}

export type WSCallback<T = unknown> = (payload: T) => void;

class WebSocketService {
  static instance: WebSocketService | null = null;
  socket: WebSocket | null = null;
  connected = false;
  reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  messageListeners: Map<string, WSCallback<unknown>[]> = new Map();
  connectionListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    WebSocketService.instance = this;
  }

  // Connexion au serveur WebSocket
  connect(token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    try {
      // Connexion avec authentification via token
      this.socket = new WebSocket(`${WS_URL}?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connexion établie');
        this.connected = true;
        this.connectionListeners.forEach((listener) => listener(true));
        
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connexion fermée', event);
        this.connected = false;
        this.connectionListeners.forEach((listener) => listener(false));
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket erreur:', error);
        this.connected = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage;
          const { type, payload } = data;

          // Notifier tous les écouteurs enregistrés pour ce type d'événement
          if (this.messageListeners.has(type)) {
            this.messageListeners.get(type)?.forEach((callback) => {
              callback(payload);
            });
          }

          // Notifier les écouteurs génériques (qui écoutent tous les événements)
          if (this.messageListeners.has('*')) {
            this.messageListeners.get('*')?.forEach((callback) => {
              callback({
                type,
                payload
              });
            });
          }
        } catch (error) {
          console.error(
            'Erreur lors du traitement du message WebSocket:',
            error
          );
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  // Planification de reconnexion automatique
  private scheduleReconnect(): void {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        console.log('Tentative de reconnexion WebSocket...');
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
        this.reconnectTimeout = null;
      }, RECONNECT_INTERVAL);
    }
  }

  // Déconnexion du WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // Envoi d'un message au serveur
  send(type: WSEventType, payload: unknown): boolean {
    if (this.connected && this.socket) {
      const message = JSON.stringify({
        type,
        payload
      });
      this.socket.send(message);
      return true;
    }
    return false;
  }

  // Abonnement à un type d'événement
  subscribe<T = unknown>(type: WSEventType, callback: WSCallback<T>): () => void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    this.messageListeners.get(type)?.push(callback as unknown as WSCallback<unknown>);

    // Retourner une fonction pour se désabonner
    return () => {
      if (this.messageListeners.has(type)) {
        const callbacks = this.messageListeners.get(type);
        if (callbacks) {
          const index = callbacks.indexOf(callback as unknown as WSCallback<unknown>);
          if (index !== -1) {
            callbacks.splice(index, 1);
          }
        }
      }
    };
  }

  // Abonnement au statut de connexion
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index !== -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }
}

// Instance singleton
export const wsService = new WebSocketService();

export default wsService;