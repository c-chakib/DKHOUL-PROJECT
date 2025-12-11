import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'webp',
    standalone: true
})
export class WebpUrlPipe implements PipeTransform {
    transform(url: string | undefined | null): string {
        if (!url) return 'assets/images/placeholder.webp'; // Default placeholder
        if (url.endsWith('.webp')) return url;

        // Check if it's a local upload path (assuming it starts with assets or uploads or http/https)
        // If it's an external URL, we might not want to blindly replace the extension unless we know we proxied it.
        // Examples: 
        // "http://localhost:3000/uploads/images/abc.jpg" -> ".../abc.webp"
        // "assets/images/hero.png" -> "assets/images/hero.webp"

        // Replace extension if it is jpg, jpeg, or png
        // return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        return url;
    }
}
