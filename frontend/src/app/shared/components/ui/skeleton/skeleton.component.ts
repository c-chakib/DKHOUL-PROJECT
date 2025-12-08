import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="animate-pulse">
            <!-- Card Skeleton -->
            <ng-container *ngIf="type === 'card'">
                <div class="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div class="h-48 bg-gray-200"></div>
                    <div class="p-5">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div class="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>
            </ng-container>

            <!-- Row Skeleton -->
            <ng-container *ngIf="type === 'row'">
                <div class="flex items-center gap-4 p-4 bg-white rounded-lg">
                    <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div class="h-8 bg-gray-200 rounded w-20"></div>
                </div>
            </ng-container>

            <!-- Text Skeleton -->
            <ng-container *ngIf="type === 'text'">
                <div class="space-y-3">
                    <div class="h-4 bg-gray-200 rounded w-full"></div>
                    <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div class="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </ng-container>

            <!-- Avatar Skeleton -->
            <ng-container *ngIf="type === 'avatar'">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div>
                        <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                </div>
            </ng-container>
        </div>
    `
})
export class SkeletonComponent {
    @Input() type: 'card' | 'row' | 'text' | 'avatar' = 'card';
}
