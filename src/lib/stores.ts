import { writable } from 'svelte/store';

const initialContent = `# Welcome to Markdown Editor

Solda yaz, sağda **canlı önizleme**.

## Özellikler

- Live preview (debounced)
- GitHub Flavored Markdown
- XSS'e karşı sanitize edilmiş çıktı

### Liste

1. İlk madde
2. İkinci madde
3. Üçüncü madde

> Alıntı bloğu.

Kod bloğu:

\`\`\`js
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

| Sütun A | Sütun B |
| ------- | ------- |
| hücre 1 | hücre 2 |
| hücre 3 | hücre 4 |

- [x] Yapıldı
- [ ] Yapılacak
`;

export const content = writable<string>(initialContent);
