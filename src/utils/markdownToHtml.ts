/**
 * markdownToHtml — Lightweight Markdown-to-HTML parser for PronosBox.
 *
 * Supported syntax:
 *   ## Heading 2       → <h2>
 *   ### Heading 3      → <h3>
 *   > blockquote       → <blockquote>
 *   ---                → <hr>
 *   - bullet           → <ul><li>
 *   **bold**           → <strong>
 *   *italic*           → <em>
 *   ~~strikethrough~~  → <del>
 *   ==highlight==      → <mark>
 *   Blank lines        → paragraph breaks
 */
export function markdownToHtml(md: string): string {
  if (!md || md.trim() === '') return '';

  const lines = md.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inBlockquote = false;

  const closeUl = () => { if (inUl) { out.push('</ul>'); inUl = false; } };
  const closeBq = () => { if (inBlockquote) { out.push('</blockquote>'); inBlockquote = false; } };

  for (const raw of lines) {
    const line = raw;

    // --- Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      closeUl(); closeBq();
      out.push('<hr/>');
      continue;
    }

    // ## Heading 2
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      closeUl(); closeBq();
      out.push(`<h2>${inlineFormat(h2[1])}</h2>`);
      continue;
    }

    // ### Heading 3
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      closeUl(); closeBq();
      out.push(`<h3>${inlineFormat(h3[1])}</h3>`);
      continue;
    }

    // > Blockquote
    const bq = line.match(/^>\s+(.*)/);
    if (bq) {
      closeUl();
      if (!inBlockquote) { out.push('<blockquote>'); inBlockquote = true; }
      out.push(`<p>${inlineFormat(bq[1])}</p>`);
      continue;
    }
    closeBq();

    // - Bullet list
    if (line.match(/^[-*]\s+/)) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      const content = inlineFormat(line.replace(/^[-*]\s+/, ''));
      out.push(`<li>${content}</li>`);
      continue;
    }
    closeUl();

    // Blank line
    if (line.trim() === '') {
      out.push('<br/>');
      continue;
    }

    // Regular paragraph
    out.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeUl();
  closeBq();

  return out.join('');
}

function inlineFormat(text: string): string {
  return text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough ~~text~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Highlight ==text==
    .replace(/==(.+?)==/g, '<mark>$1</mark>');
}
