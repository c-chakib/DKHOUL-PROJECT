import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
    name: 'resolveUrl',
    standalone: true
})
export class ResolveUrlPipe implements PipeTransform {
    transform(url: string | undefined | null): string | null {
        if (!url) return null;
        if (url.startsWith('data:')) return url;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/assets')) return url;
        if (url.startsWith('assets')) return url;

        if (url.startsWith('/uploads')) {
            // Remove /api/v1 if present in apiUrl to get base URL
            // Assuming apiUrl is something like http://localhost:3000/api/v1
            const baseUrl = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
            return baseUrl + url;
        }

        return url;
    }
}
