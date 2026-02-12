import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect(): void {
        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: (...args: any[]) => void): void {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void): void {
        this.socket?.off(event, callback);
    }

    emit(event: string, data?: any): void {
        this.socket?.emit(event, data);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
