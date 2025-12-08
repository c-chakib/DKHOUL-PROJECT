import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ChatWindowComponent } from './features/chat/chat-window/chat-window.component';
import { AiGuideComponent } from './features/ai/ai-guide/ai-guide.component';
import { AuthService } from './core/services/auth.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ChatWindowComponent, AiGuideComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar></app-navbar>
      <main class="flex-grow pt-16">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      
      <!-- Global P2P Chat -->
      <app-chat-window *ngIf="authService.currentUser()"></app-chat-window>

      <!-- AI Guide (Chakib/CHAKIB) -->
      <app-ai-guide></app-ai-guide>
    </div>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  ngOnInit() {
    this.authService.initGoogleAuth();
  }
}
