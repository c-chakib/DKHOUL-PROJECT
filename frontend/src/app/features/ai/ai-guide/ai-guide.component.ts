import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../../core/services/ai.service';

@Component({
    selector: 'app-ai-guide',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ai-guide.component.html',
    styleUrls: ['./ai-guide.component.scss']
})
export class AiGuideComponent implements AfterViewChecked {
    aiService = inject(AiService);

    isOpen = signal(false);
    newMessage = signal('');

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    constructor() {
        // Auto-scroll when messages change
        effect(() => {
            this.aiService.messages(); // track dependency
            setTimeout(() => this.scrollToBottom(), 100);
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
        this.isOpen.update(v => !v);
    }

    sendMessage() {
        if (!this.newMessage().trim() || this.aiService.isLoading()) return;

        const msg = this.newMessage();
        this.newMessage.set('');
        this.aiService.sendMessage(msg);
    }
}
