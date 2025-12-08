import { Injectable } from '@angular/core';

/**
 * Helper service for managing icon paths
 */
@Injectable({
    providedIn: 'root'
})
export class IconService {
    private basePath = 'assets/icons';

    /**
     * Get category icon path
     */
    getCategoryIcon(category: string): string {
        const categoryMap: Record<string, string> = {
            'SPACE': 'categories/space.png',
            'SKILL': 'categories/skill.png',
            'CONNECT': 'categories/connect.png'
        };
        return `${this.basePath}/${categoryMap[category] || 'categories/default.png'}`;
    }

    /**
     * Get activity-specific icon
     */
    getActivityIcon(activity: string): string {
        const activityMap: Record<string, string> = {
            'cooking': 'categories/cooking.png',
            'adventure': 'categories/adventure.png',
            'culture': 'categories/culture.png',
            'surf': 'categories/surf.png',
            'desert': 'categories/desert.png',
            'pottery': 'categories/pottery.png'
        };
        return `${this.basePath}/${activityMap[activity.toLowerCase()] || 'categories/default.png'}`;
    }

    /**
     * Get UI icon path
     */
    getUIIcon(name: string): string {
        return `${this.basePath}/ui/${name}.svg`;
    }
}
