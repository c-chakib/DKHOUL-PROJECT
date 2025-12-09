import { Injectable, signal, inject, computed } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
    _id?: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: Date;
    read?: boolean;
}

export interface ChatUser {
    _id: string;
    name: string;
    photo?: string;
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private socket: Socket;
    // private readonly URL = 'http://localhost:5000'; // Removed
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    // Signals
    messages = signal<ChatMessage[]>([]);
    contacts = signal<ChatUser[]>([]);
    currentChatUser = signal<ChatUser | null>(null);
    connected = signal<boolean>(false);
    isOpen = signal<boolean>(false); // Control window visibility globally
    currentContext = signal<string | null>(null); // Context of the conversation (e.g. "Service: Camel Ride")

    // Computed: Filter messages for current chat
    currentConversation = computed(() => {
        const user = this.currentChatUser();
        if (!user) return [];
        return this.messages().filter(m =>
            (m.sender === user._id) || (m.receiver === user._id)
        );
    });

    constructor() {
        this.socket = io(environment.socketUrl);

        // Auto-join on connect if user is logged in
        if (this.authService.currentUser()) {
            this.joinChat();
        }

    }

    joinChat() {
        const user = this.authService.currentUser();
        if (user) {
            this.socket.emit('join_chat', user._id);
            this.connected.set(true);
            this.fetchContacts();
        }
    }

    private setupSocketListeners() {
        this.socket.on('new_message', (message: ChatMessage) => {
            this.messages.update(msgs => [...msgs, message]);
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connected.set(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connected.set(false);
        });
    }

    sendMessage(content: string) {
        const receiver = this.currentChatUser();
        const sender = this.authService.currentUser();

        if (receiver && sender) {
            const messageData = {
                senderId: sender._id,
                receiverId: receiver._id,
                message: content
            };

            this.socket.emit('send_message', messageData);

            // Optimistic update
            const optimisticMsg: ChatMessage = {
                sender: sender._id,
                receiver: receiver._id,
                content: content,
                timestamp: new Date()
            };
            this.messages.update(msgs => [...msgs, optimisticMsg]);
        }
    }

    selectUser(user: ChatUser) {
        this.currentChatUser.set(user);
        this.fetchHistory(user._id);
    }

    toggleChat() {
        this.isOpen.update(v => !v);
        if (this.isOpen() && !this.connected()) {
            this.joinChat();
        }
    }

    openChatWith(user: ChatUser) {
        this.selectUser(user);
        this.isOpen.set(true);
        if (!this.connected()) {
            this.joinChat();
        }
    }

    async initiateChat(hostId: string, fullHost?: any, context?: string) {
        // Find user in contacts or fetch if needed
        let user = this.contacts().find(u => u._id === hostId);

        if (!user && fullHost) {
            // Use the full host object passed from the component
            user = {
                _id: hostId,
                name: fullHost.name || 'Hôte',
                photo: fullHost.photo,
                email: fullHost.email || '',
                role: 'host'
            };
            // Add to contacts temporarily so it persists in the session list
            this.contacts.update(c => [...c, user!]);
        } else if (!user) {
            // Fallback if no fullHost provided (should verify with backend in ideal world)
            user = {
                _id: hostId,
                name: 'Hôte',
                email: '',
                role: 'host'
            };
        }

        if (context) {
            // We can store this in a signal to show "Chatting about: {context}" in the window
            this.currentContext.set(context);
        } else {
            this.currentContext.set(null);
        }

        this.openChatWith(user!);
    }

    async fetchContacts() {
        try {
            const res: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/chats/contacts`));
            if (res.data && res.data.users) {
                this.contacts.set(res.data.users);
            }
        } catch (err) {
            console.error('Error fetching contacts', err);
        }
    }

    async fetchHistory(userId: string) {
        try {
            const res: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/chats/history/${userId}`));
            if (res.data && res.data.messages) {
                // Merge history with current messages signal
                const history = res.data.messages;
                this.messages.update(current => {
                    const otherMessages = current.filter(m => m.sender !== userId && m.receiver !== userId);
                    return [...otherMessages, ...history];
                });
            }
        } catch (err) {
            console.error('Error fetching history', err);
        }
    }
}
