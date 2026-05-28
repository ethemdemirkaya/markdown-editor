export type OutlineItem = {
  level: number;
  text: string;
  index: number;
};

export function parseOutline(markdown: string): OutlineItem[] {
  const result: OutlineItem[] = [];
  let inFence = false;
  let fenceMarker = '';
  let headingIndex = 0;

  const lines = markdown.split('\n');
  for (const line of lines) {
    const fenceMatch = /^(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1];
      } else if (line.startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      continue;
    }
    if (inFence) continue;

    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      result.push({
        level: m[1].length,
        text: m[2].trim(),
        index: headingIndex++,
      });
    }
  }

  return result;
}

export function scrollToHeading(index: number): void {
  const root = document.querySelector('.wysiwyg .ProseMirror');
  if (!root) return;
  const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const target = headings[index];
  if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
