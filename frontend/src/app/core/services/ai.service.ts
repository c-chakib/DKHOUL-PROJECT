import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiMessage {
    role: 'user' | 'model';
    text: string;
}

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/ai`;

    // State for the component
    messages = signal<AiMessage[]>([
        { role: 'model', text: 'Salam ! Je suis CHAKIB, votre guide personnel. Comment puis-je vous aider à découvrir le Maroc ? 🇲🇦' }
    ]);
    isLoading = signal(false);

    async sendMessage(message: string) {
        // Optimistic update
        this.messages.update(msgs => [...msgs, { role: 'user', text: message }]);
        this.isLoading.set(true);

        try {
            const res: any = await firstValueFrom(this.http.post(`${this.apiUrl}/chat`, { message }));

            if (res.status === 'success' && res.data && res.data.reply) {
                this.messages.update(msgs => [...msgs, { role: 'model', text: res.data.reply }]);
            }
        } catch (err) {
            console.error('AI Chat Error:', err);
            this.messages.update(msgs => [...msgs, { role: 'model', text: "Désolé, j'ai eu un petit problème de connexion. Réessayez s'il vous plaît." }]);
        } finally {
            this.isLoading.set(false);
        }
    }
}
