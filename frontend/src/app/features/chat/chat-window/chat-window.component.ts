import { Component, inject, signal, effect, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-chat-window',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat-window.component.html',
    styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements AfterViewChecked {
    chatService = inject(ChatService);
    authService = inject(AuthService);

    // isOpen = signal(false); // Removed local signal
    showContacts = signal(true);
    newMessage = signal('');

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    constructor() {
        effect(() => {
            if (this.chatService.currentChatUser()) {
                this.showContacts.set(false);
            } else {
                this.showContacts.set(true);
            }
        });
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }

    toggleChat() {
        this.chatService.toggleChat();
    }

    selectUser(user: any) {
        this.chatService.selectUser(user);
    }

    backToContacts() {
        this.chatService.currentChatUser.set(null);
    }

    sendMessage() {
        if (!this.newMessage().trim()) return;
        this.chatService.sendMessage(this.newMessage());
        this.newMessage.set('');
        this.scrollToBottom();
    }
}
