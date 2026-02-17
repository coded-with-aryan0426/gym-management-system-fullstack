import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useRealtimeEquipment = (onUpdate: (data?: any) => void) => {
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // Initialize STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('Connected to Equipment WebSocket');
                client.subscribe('/topic/equipment-updates', (message) => {
                    if (message.body) {
                        try {
                            const data = JSON.parse(message.body);
                            onUpdate(data);
                        } catch (e) {
                            console.error('Failed to parse websocket message', e);
                            onUpdate();
                        }
                    } else {
                        onUpdate();
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            reconnectDelay: 5000,
        });

        client.activate();
        clientRef.current = client;

        // Fallback polling (every 15s)
        const pollInterval = setInterval(() => {
            if (!client.connected) {
                // If WS not connected, trigger update to force refresh via API
                onUpdate();
            }
        }, 15000);

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
            clearInterval(pollInterval);
        };
    }, [onUpdate]);
};
