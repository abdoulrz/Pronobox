import React, { useRef, useState, useCallback } from 'react';
import { markdownToHtml } from '../utils/markdownToHtml';

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

/* ── Toolbar button definitions ─────────────────────────────────────────── */
type ToolbarItem =
  | { kind: 'inline'; label: string; title: string; icon: React.ReactNode; prefix: string; suffix: string }
  | { kind: 'line';   label: string; title: string; icon: React.ReactNode; linePrefix: string }
  | { kind: 'block';  label: string; title: string; icon: React.ReactNode; template: string }
  | { kind: 'sep' };

const TOOLBAR: ToolbarItem[] = [
  /* Inline */
  {
    kind: 'inline', label: 'B', title: 'Gras (Ctrl+B)',
    icon: <span className="font-black text-sm">B</span>,
    prefix: '**', suffix: '**',
  },
  {
    kind: 'inline', label: 'I', title: 'Italique (Ctrl+I)',
    icon: <span className="italic font-semibold text-sm">I</span>,
    prefix: '*', suffix: '*',
  },
  {
    kind: 'inline', label: 'S', title: 'Barré',
    icon: <span className="line-through font-semibold text-sm">S</span>,
    prefix: '~~', suffix: '~~',
  },
  {
    kind: 'inline', label: 'H', title: 'Surligner (==texte==)',
    icon: (
      <span className="relative text-sm font-black px-0.5">
        <span className="relative z-10">H</span>
        <span className="absolute inset-x-0 bottom-0 h-[50%] bg-yellow-300/60 dark:bg-yellow-400/40 z-0 rounded-sm" />
      </span>
    ),
    prefix: '==', suffix: '==',
  },
  { kind: 'sep' },
  /* Line-level */
  {
    kind: 'line', label: 'H2', title: 'Titre de section (## Titre)',
    icon: <span className="text-[11px] font-black leading-none">H2</span>,
    linePrefix: '## ',
  },
  {
    kind: 'line', label: 'H3', title: 'Sous-titre (### Titre)',
    icon: <span className="text-[11px] font-black leading-none">H3</span>,
    linePrefix: '### ',
  },
  {
    kind: 'line', label: '•', title: 'Point clé (- item)',
    icon: <span className="text-base font-bold leading-none">•</span>,
    linePrefix: '- ',
  },
  {
    kind: 'line', label: '>', title: 'Citation / Encadré',
    icon: <span className="text-sm font-bold leading-none">&ldquo;</span>,
    linePrefix: '> ',
  },
  { kind: 'sep' },
  /* Block inserts */
  {
    kind: 'block', label: '—', title: 'Séparateur horizontal',
    icon: <span className="text-sm font-bold leading-none">—</span>,
    template: '\n---\n',
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function wordCount(text: string) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  id, value, onChange, placeholder, rows = 5, label,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  const applyFormat = useCallback((item: ToolbarItem) => {
    const ta = ref.current;
    if (!ta || item.kind === 'sep') return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);

    let newValue = value;
    let newCursorStart = start;
    let newCursorEnd = end;

    if (item.kind === 'inline') {
      if (selected) {
        const isWrapped =
          value.slice(start - item.prefix.length, start) === item.prefix &&
          value.slice(end, end + item.suffix.length) === item.suffix;
        if (isWrapped) {
          newValue =
            value.slice(0, start - item.prefix.length) +
            selected +
            value.slice(end + item.suffix.length);
          newCursorStart = start - item.prefix.length;
          newCursorEnd = end - item.prefix.length;
        } else {
          newValue = value.slice(0, start) + item.prefix + selected + item.suffix + value.slice(end);
          newCursorStart = start + item.prefix.length;
          newCursorEnd = end + item.prefix.length;
        }
      } else {
        const ph = 'texte';
        newValue = value.slice(0, start) + item.prefix + ph + item.suffix + value.slice(end);
        newCursorStart = start + item.prefix.length;
        newCursorEnd = newCursorStart + ph.length;
      }
    }

    if (item.kind === 'line') {
      const before = value.slice(0, start);
      const lineStart = before.lastIndexOf('\n') + 1;
      const linesSegment = value.slice(lineStart, end || start);
      const after = value.slice(end || start);

      // All known line-level prefixes — used to strip competing ones
      const ALL_LINE_PREFIXES = ['## ', '### ', '- ', '* ', '> '];

      const toggled = linesSegment
        .split('\n')
        .map(line => {
          // Check if this line already has THIS prefix → toggle off
          if (line.startsWith(item.linePrefix)) {
            return line.slice(item.linePrefix.length);
          }
          // Otherwise: strip ALL competing prefixes first, then apply ours
          let stripped = line;
          for (const p of ALL_LINE_PREFIXES) {
            if (stripped.startsWith(p)) {
              stripped = stripped.slice(p.length);
              break; // only one can be active at a time
            }
          }
          return item.linePrefix + stripped;
        })
        .join('\n');

      newValue = value.slice(0, lineStart) + toggled + after;
      newCursorStart = lineStart;
      newCursorEnd = lineStart + toggled.length;
    }

    if (item.kind === 'block') {
      newValue = value.slice(0, start) + item.template + value.slice(end);
      newCursorStart = newCursorEnd = start + item.template.length;
    }

    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursorStart, newCursorEnd);
    });
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); applyFormat(TOOLBAR[0]); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); applyFormat(TOOLBAR[1]); }
    // Auto-continue list items on Enter
    if (e.key === 'Enter') {
      const ta = ref.current;
      if (!ta) return;
      const pos = ta.selectionStart;
      const before = value.slice(0, pos);
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = before.slice(lineStart);
      const listMatch = currentLine.match(/^([-*>]\s+|#+\s+)/);
      if (listMatch) {
        e.preventDefault();
        const prefix = listMatch[0];
        const ins = '\n' + prefix;
        const newValue = value.slice(0, pos) + ins + value.slice(pos);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(pos + ins.length, pos + ins.length);
        });
      }
    }
  };

  const chars = value.length;
  const words = wordCount(value);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-brand-slate/50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-green/30 transition-all">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-brand-navy-2 px-2 py-1.5 border-b border-slate-200 dark:border-brand-slate/40">
        {TOOLBAR.map((item, idx) =>
          item.kind === 'sep' ? (
            <div key={idx} className="w-px h-5 bg-slate-300 dark:bg-brand-slate mx-1 shrink-0" />
          ) : (
            <button
              key={idx}
              type="button"
              title={item.title}
              onClick={() => applyFormat(item)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-brand-navy-3 text-slate-500 dark:text-slate-400 hover:text-brand-green dark:hover:text-brand-green transition-all shrink-0 overflow-hidden"
            >
              {item.icon}
            </button>
          )
        )}

        {/* Mode toggle */}
        <div className="ml-auto flex items-center gap-1 bg-slate-200 dark:bg-brand-navy-3 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${mode === 'write' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Éditer
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${mode === 'preview' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Aperçu
          </button>
        </div>
      </div>

      {/* ── Editor / Preview ─────────────────────────────────────────────── */}
      {label && <label htmlFor={id} className="sr-only">{label}</label>}

      {mode === 'write' ? (
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          className="w-full font-mono text-sm bg-white dark:bg-brand-navy-3 p-4 text-slate-800 dark:text-slate-100 outline-none transition-all resize-y leading-relaxed"
        />
      ) : (
        <div
          className={`prono-md min-h-[${rows * 1.625}rem] p-4 text-sm bg-white dark:bg-brand-navy-3 text-slate-700 dark:text-slate-200 leading-relaxed overflow-y-auto`}
          dangerouslySetInnerHTML={{
            __html: markdownToHtml(value) || '<p class="text-slate-400 italic">Rien à afficher.</p>'
          }}
        />
      )}

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-brand-navy-2 border-t border-slate-200 dark:border-brand-slate/40 text-[10px] text-slate-400 font-medium select-none">
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline-flex gap-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-brand-navy-3 font-mono">**bold**</kbd>
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-brand-navy-3 font-mono">*ital*</kbd>
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-brand-navy-3 font-mono">==surligné==</kbd>
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-brand-navy-3 font-mono">&gt; citation</kbd>
          </span>
        </span>
        <span className="ml-auto">{words} mots · {chars} car.</span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
