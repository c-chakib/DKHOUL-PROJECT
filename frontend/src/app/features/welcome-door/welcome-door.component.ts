import { Component, signal, WritableSignal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome-door',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-door.component.html',
  styleUrls: ['./welcome-door.component.scss'],
  animations: [
    trigger('doorState', [
      state('closed', style({ transform: 'rotateY(0)' })),
      state('openLeft', style({ transform: 'rotateY(-110deg)' })),
      state('openRight', style({ transform: 'rotateY(110deg)' })),
      transition('closed => openLeft', [
        animate('1.5s cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
      transition('closed => openRight', [
        animate('1.5s cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        // REMOVED DELAY: Immediate fade out (0.5s) when isVisible becomes false
        animate('0.5s ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class WelcomeDoorComponent {
  authService = inject(AuthService);
  isVisible: WritableSignal<boolean> = signal(false);
  doorState: WritableSignal<'closed' | 'open'> = signal('closed');
  showButton: WritableSignal<boolean> = signal(false);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        // If User Logs Out -> RESET STATE
        if (!user) {
          this.isVisible.set(false);
          this.doorState.set('closed');
          this.showButton.set(false);
        } else {
          // User Logged In
          const hasSeenIntro = sessionStorage.getItem('dkhoul_intro_seen');

          if (!hasSeenIntro && !this.isVisible()) {
            this.startIntroSequence();
          }
        }
      }
    });
  }

  startIntroSequence() {
    // Force clean state
    this.doorState.set('closed');
    this.showButton.set(false);

    this.isVisible.set(true);

    // Show button quickly
    setTimeout(() => this.showButton.set(true), 300);

    // Auto-open after 5 seconds if no interaction
    setTimeout(() => {
      if (this.doorState() === 'closed') {
        this.openDoors();
      }
    }, 5000);
  }

  openDoors(): void {
    if (this.doorState() === 'open') return;

    this.showButton.set(false);
    this.doorState.set('open');
    sessionStorage.setItem('dkhoul_intro_seen', 'true');

    // Remove from DOM match animation duration exactly (1.5s)
    setTimeout(() => {
      this.isVisible.set(false);
    }, 1500);
  }
}
