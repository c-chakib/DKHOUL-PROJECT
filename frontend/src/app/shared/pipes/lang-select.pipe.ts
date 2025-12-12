import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'langSelect',
    standalone: true
})
export class LangSelectPipe implements PipeTransform {

    transform(value: any, lang: string): string {
        if (!value) return '';

        // If value is a simple string, return it (backward compatibility)
        if (typeof value === 'string') return value;

        // Check specific language
        if (value[lang]) return value[lang];

        // Fallbacks
        if (value['fr']) return value['fr'];
        if (value['en']) return value['en'];
        if (value['ar']) return value['ar'];

        // If nothing found, return first available key
        const keys = Object.keys(value);
        return keys.length > 0 ? value[keys[0]] : '';
    }

}
