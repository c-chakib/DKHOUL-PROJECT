import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket;
    private isConnected = false;

    constructor() {
        this.socket = io(environment.socketUrl || 'http://localhost:5000');

        this.socket.on('connect', () => {
            console.log('Global Socket connected');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Global Socket disconnected');
            this.isConnected = false;
        });
    }

    // Listen to an event
    listen<T>(eventName: string): Observable<T> {
        return new Observable<T>(observer => {
            this.socket.on(eventName, (data: T) => {
                observer.next(data);
            });

            // Cleanup logic
            return () => {
                this.socket.off(eventName);
            };
        });
    }

    // Emit an event
    emit(eventName: string, data: any) {
        this.socket.emit(eventName, data);
    }
}
