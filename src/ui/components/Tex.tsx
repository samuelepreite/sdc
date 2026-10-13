import katex from 'katex';
import { Fragment, useMemo } from 'react';

/**
 * Macro della notazione della dispensa (Cap. 1, §1.1.3): tensore del II ordine = maiuscola con tilde sottoscritta,
 * vettore = minuscola sottosegnata. Le stesse macro sono usate nelle trascrizioni (tools/testi).
 */
export const MACROS: Record<string, string> = { '\\tens': '\\underset{\\sim}{#1}', '\\vet': '\\underline{#1}' };

/** Formula LaTeX renderizzata con KaTeX. Gli errori di sintassi non bloccano la pagina. */
export function Tex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html', macros: { ...MACROS } }), [tex, display]);
  return display ? <div className="tex-display" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Testo con formule: `$…$` in linea, `$$…$$` a blocco, `**grassetto**`, paragrafi separati da riga vuota.
 * Volutamente minimale: i contenuti sono scritti da noi, non dall'utente.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n/);
  return <div className={className}>{paras.map((p, i) => block(p, i))}</div>;
}

/** un blocco: paragrafo, oppure righe «- …» (elenco puntato) o «1. …» (elenco numerato), con eventuale testo prima */
function block(p: string, key: number) {
  const lines = p.split('\n');
  const isItem = (l: string) => /^\s*(- |\d+\. )/.test(l);
  const first = lines.findIndex(isItem);
  if (first < 0) return <p key={key}>{inline(p)}</p>;
  const head = lines.slice(0, first).join('\n');
  const items: string[] = [];
  for (const l of lines.slice(first)) {
    if (isItem(l)) items.push(l.replace(/^\s*(- |\d+\. )/, ''));
    else if (items.length) items[items.length - 1] += ' ' + l.trim();
  }
  const ordered = /^\s*\d+\. /.test(lines[first]);
  const list = items.map((it, j) => <li key={j}>{inline(it)}</li>);
  return (
    <Fragment key={key}>
      {head.trim() && <p>{inline(head)}</p>}
      {ordered ? <ol>{list}</ol> : <ul>{list}</ul>}
    </Fragment>
  );
}

export function inline(src: string) {
  const out: React.ReactNode[] = [];
  const re = /\$\$([^$]+)\$\$|\$([^$]+)\$|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(<Fragment key={k++}>{src.slice(last, m.index)}</Fragment>);
    if (m[1] !== undefined) out.push(<Tex key={k++} tex={m[1]} display />);
    else if (m[2] !== undefined) out.push(<Tex key={k++} tex={m[2]} />);
    else out.push(<strong key={k++}>{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < src.length) out.push(<Fragment key={k++}>{src.slice(last)}</Fragment>);
  return out;
}

export function Inline({ text }: { text: string }) {
  return <>{inline(text)}</>;
}
