
import { useEffect, useState } from 'react';
import wsService, { WSEventType, WSCallback } from '../services/WebSocketService';

// Hook React pour utiliser le service WebSocket
export function useWebSocket() {
  const [connected, setConnected] = useState(wsService.connected);

  useEffect(() => {
    // S'abonner aux changements de statut de connexion
    const unsubscribe = wsService.onConnectionChange(setConnected);

    // Tenter de se connecter si un token existe
    const token = localStorage.getItem('token');
    if (token && !wsService.connected) {
      wsService.connect(token);
    }

    // Nettoyage à la destruction du composant
    return () => {
      unsubscribe();
    };
  }, []);

  // Fonctions utilitaires pour les composants
  const subscribe = <T>(eventType: WSEventType, callback: WSCallback<T>) => {
    return wsService.subscribe(eventType, callback);
  };

  const send = (eventType: WSEventType, payload: unknown) => {
    return wsService.send(eventType, payload);
  };

  return {
    connected,
    subscribe,
    send,
    wsService
  };
}
