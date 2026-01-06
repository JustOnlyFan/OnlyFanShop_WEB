import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = ''

export interface WebSocketMessage {
  roomId: string
  senderId: string
  senderName?: string
  message: string
  timestamp?: number
  isRead?: boolean
}

class WebSocketService {
  private client: Client | null = null
  private subscribers: Map<string, (message: WebSocketMessage) => void> = new Map()
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.client?.connected) {
        resolve()
        return
      }

      const token = tokenStorage.getAccessToken()
      if (!token) {
        reject(new Error('No authentication token'))
        return
      }

      // Use SockJS for fallback support
      const socket = new SockJS(`${API_URL}/ws`)
      this.client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          // Subscribe to all existing room subscriptions
          this.subscribers.forEach((callback, roomId) => {
            this.subscribeToRoom(roomId, callback)
          })
          
          resolve()
        },
        onStompError: (frame) => {
          console.error('WebSocket STOMP error:', frame)
          this.isConnected = false
          reject(new Error('WebSocket connection error'))
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed')
          this.isConnected = false
          this.handleReconnect()
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected')
          this.isConnected = false
        },
        connectHeaders: {
          Authorization: `Bearer ${token}`
        }
      })

      this.client.activate()
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => {
        this.connect().catch(console.error)
      }, 5000 * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  subscribeToRoom(roomId: string, callback: (message: WebSocketMessage) => void) {
    if (!this.client || !this.client.connected) {
      // Store subscription for when connection is established
      this.subscribers.set(roomId, callback)
      this.connect().then(() => {
        this.subscribeToRoom(roomId, callback)
      }).catch(console.error)
      return
    }

    this.subscribers.set(roomId, callback)

    this.client.subscribe(`/topic/chat/${roomId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        callback({
          roomId: data.roomId,
          senderId: data.senderId,
          senderName: data.senderName,
          message: data.message,
          timestamp: data.epochMillis || data.timestamp,
          isRead: data.isRead
        })
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })
  }

  unsubscribeFromRoom(roomId: string) {
    this.subscribers.delete(roomId)
    // Note: STOMP client doesn't need explicit unsubscribe for topic subscriptions
  }

  sendMessage(roomId: string, message: string) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected')
      return
    }

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        roomId,
        message
      })
    })
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate()
      this.client = null
      this.isConnected = false
      this.subscribers.clear()
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected && this.client?.connected === true
  }
}

export const websocketService = new WebSocketService()

