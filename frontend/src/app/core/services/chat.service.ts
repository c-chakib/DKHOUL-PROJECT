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

    async initiateChat(hostId: string) {
        // Find user in contacts or fetch if needed
        let user = this.contacts().find(u => u._id === hostId);
        if (!user) {
            // If not in contacts, we might need to fetch the user profile first
            // For now, we'll try to join chat which fetches contacts
            if (!this.connected()) {
                this.joinChat();
                // Wait briefly or just open using partial data if we had it
            }
            // NOTE: Ideally we fetch user by ID here. 
            // But for the diagnostic fix, we assume the calling component (ServiceDetail) might have passed a full user object, 
            // OR we just create a temporary user object since we have the ID.
            user = {
                _id: hostId,
                name: 'Host', // Placeholder until fetched
                email: '',
                role: 'host'
            };
        }
        this.openChatWith(user);
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
