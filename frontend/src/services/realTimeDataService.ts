// Real-Time Data Service for Enhanced User Action Modals

import type {
  RealTimeDataProvider,
  RealTimeUserData,
  DataUpdate,
  Observable,
  Relationship
} from '../types/modalEnhancement';
import type { User } from '../types/user';

// Simple Observable implementation (can be replaced with RxJS if needed)
class SimpleObservable<T> implements Observable<T> {
  private observers: ((value: T) => void)[] = [];

  subscribe(observer: (value: T) => void): { unsubscribe: () => void } {
    this.observers.push(observer);
    return {
      unsubscribe: () => {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      }
    };
  }

  next(value: T): void {
    this.observers.forEach(observer => observer(value));
  }
}

export class RealTimeDataService implements RealTimeDataProvider {
  private wsConnection: WebSocket | null = null;
  private subscriptions: Map<string, SimpleObservable<any>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private wsUrl: string;

  constructor(wsUrl: string = 'ws://localhost:8080/ws') {
    this.wsUrl = wsUrl;
    // Disable WebSocket connection for now - using polling instead
    // this.connect();
  }

  private connect(): void {
    if (this.isConnecting || this.wsConnection?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      this.wsConnection = new WebSocket(this.wsUrl);

      this.wsConnection.onopen = () => {
        console.log('[RealTimeDataService] WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const update: DataUpdate = JSON.parse(event.data);
          this.handleDataUpdate(update);
        } catch (error) {
          console.error('[RealTimeDataService] Failed to parse message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('[RealTimeDataService] WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        console.error('[RealTimeDataService] WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('[RealTimeDataService] Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[RealTimeDataService] Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      console.log(`[RealTimeDataService] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private handleDataUpdate(update: DataUpdate): void {
    const subscriptionKey = this.getSubscriptionKey(update.type, update.userId);
    const observable = this.subscriptions.get(subscriptionKey);

    if (observable) {
      observable.next(update.data);
    }
  }

  private getSubscriptionKey(type: string, userId: number): string {
    return `${type}_${userId}`;
  }

  subscribeToUserUpdates(userId: number): Observable<User> {
    const subscriptionKey = this.getSubscriptionKey('user_update', userId);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new SimpleObservable<User>());

      // Send subscription request to server
      this.sendSubscriptionRequest('user_update', userId);
    }

    return this.subscriptions.get(subscriptionKey)!;
  }

  subscribeToRelationshipUpdates(userId: number): Observable<Relationship[]> {
    const subscriptionKey = this.getSubscriptionKey('relationship_update', userId);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new SimpleObservable<Relationship[]>());

      // Send subscription request to server
      this.sendSubscriptionRequest('relationship_update', userId);
    }

    return this.subscriptions.get(subscriptionKey)!;
  }

  unsubscribe(subscriptionId: string): void {
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);

      // Send unsubscription request to server
      this.sendUnsubscriptionRequest(subscriptionId);
    }
  }

  isConnected(): boolean {
    // For polling-based approach, always return true
    return true;
  }

  async getLatestData(userId: number): Promise<RealTimeUserData> {
    // Use the enhancedApi to get the latest data
    try {
      // Import enhancedApi dynamically to avoid circular dependencies
      const { enhancedApi } = await import('./enhancedApi');
      return await enhancedApi.getRealTimeUserData(userId);
    } catch (error) {
      console.error('[RealTimeDataService] Failed to get latest data:', error);
      throw error;
    }
  }

  private sendSubscriptionRequest(type: string, userId: number): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      const message = {
        action: 'subscribe',
        type,
        userId
      };
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  private sendUnsubscriptionRequest(subscriptionId: string): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      const message = {
        action: 'unsubscribe',
        subscriptionId
      };
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  // Cleanup method
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
  }

}

// Singleton instance
export const realTimeDataService = new RealTimeDataService();
