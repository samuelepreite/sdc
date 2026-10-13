/**
 * Scheda «a pezzi»: la scheda di un concetto viene presentata in 2–4 pezzi, con una domanda di richiamo tra un pezzo
 * e l'altro (pratica di recupero intercalata alla lettura: si risponde prima di andare avanti).
 *
 * Regole (scelta didattica, deduzione):
 *  1. primo pezzo: significato e formule;
 *  2. se la scheda ha un modello o un diagramma, un pezzo dedicato;
 *  3. la spiegazione divisa in paragrafi: in due pezzi se ha almeno 3 paragrafi (2 se manca il diagramma),
 *     altrimenti in uno; gli errori tipici chiudono l'ultimo pezzo;
 *  4. al massimo 4 pezzi; le domande di richiamo della scheda, nel loro ordine, fanno da «porta» tra i pezzi.
 */
import type { Concept, RecallQ } from '../content/types';

export type Piece = { kind: 'base' } | { kind: 'diagram' } | { kind: 'text'; paras: string[]; pitfalls: boolean };

export interface Chunked {
  pieces: Piece[];
  /** gates[i] è la domanda tra il pezzo i e il pezzo i + 1 (null: si va avanti senza domanda) */
  gates: (RecallQ | null)[];
}

export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function chunkConcept(c: Concept): Chunked {
  const paras = paragraphs(c.explanation);
  const pieces: Piece[] = [{ kind: 'base' }];
  if (c.visual) pieces.push({ kind: 'diagram' });
  const splitAt = paras.length >= (c.visual ? 3 : 2) ? Math.ceil(paras.length / 2) : paras.length;
  const parts = [paras.slice(0, splitAt), paras.slice(splitAt)].filter((p) => p.length > 0);
  parts.forEach((p, i) => pieces.push({ kind: 'text', paras: p, pitfalls: i === parts.length - 1 }));
  if (parts.length === 0) pieces.push({ kind: 'text', paras: [], pitfalls: true });
  const gates = pieces.slice(1).map((_, i) => c.recall[i] ?? null);
  return { pieces, gates };
}
