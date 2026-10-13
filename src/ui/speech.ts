/**
 * Lettura ad alta voce delle spiegazioni (voce italiana del sistema, Web Speech API): il «professore che parla».
 * Le formule LaTeX vengono rese in parole con regole semplici; se il browser non ha la sintesi vocale il tasto non compare.
 */
const WORDS: [RegExp, string][] = [
  [/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, ' $1 fratto $2 '],
  [/\\mathrm\{cotg\}|\\text\{cotg\}|\\cot\b/g, ' cotangente di '],
  [/\\cos/g, ' coseno di '],
  [/\\sin|\\text\{sen\}/g, ' seno di '],
  [/\\tan/g, ' tangente di '],
  [/\\sqrt\{([^{}]+)\}/g, ' radice di $1 '],
  [/\\vec\s*/g, ' '],
  [/\\tens\s*\{?([A-Za-z])\}?/g, ' tensore $1 '],
  [/\\vet\s*\{?([A-Za-z])\}?/g, ' vettore $1 '],
  [/\\hat\s*\{?([a-zA-Z])\}?/g, ' versore $1 '],
  [/\\otimes/g, ' diade '],
  [/\\wedge/g, ' vettor '],
  [/\\operatorname\{tr\}/g, ' traccia di '],
  [/\\operatorname\{div\}/g, ' divergenza di '],
  [/\\operatorname\{rot\}/g, ' rotore di '],
  [/\\operatorname\{sym\}/g, ' parte simmetrica di '],
  [/\\operatorname\{skw\}/g, ' parte antisimmetrica di '],
  [/\\det/g, ' determinante di '],
  [/\\nabla/g, ' gradiente di '],
  [/\\partial/g, ' derivata parziale di '],
  [/\\mathbb\{([A-Z])\}/g, ' $1 '],
  [/\\mathrm\{([A-Za-z]+)\}/g, ' $1 '],
  [/\\sum/g, ' somma '],
  [/\\int/g, ' integrale '],
  [/\\Rightarrow/g, ', quindi, '],
  [/\\iff/g, ' se e solo se '],
  [/\\in\b/g, ' appartenente a '],
  [/\\perp/g, ' ortogonale a '],
  [/\\simeq/g, ' circa uguale a '],
  [/\\neq/g, ' diverso da '],
  [/\\lambda/g, ' lambda '],
  [/\\mu\b/g, ' mu '],
  [/\\nu\b/g, ' nu '],
  [/\\tau/g, ' tau '],
  [/\\gamma/g, ' gamma '],
  [/\\theta/g, ' teta '],
  [/\\delta/g, ' delta '],
  [/\\varepsilon|\\epsilon/g, ' epsilon '],
  [/\\rho/g, ' ro '],
  [/\\beta/g, ' beta '],
  [/\\alpha/g, ' alfa '],
  [/\\varphi|\\phi/g, ' fi '],
  [/\\psi/g, ' psi '],
  [/\\chi/g, ' chi '],
  [/\\eta/g, ' eta '],
  [/\\xi/g, ' csi '],
  [/\\sigma/g, ' sigma '],
  [/\\omega/g, ' omega '],
  [/\\pi/g, ' pi greco '],
  [/\\Delta/g, ' delta '],
  [/\\cdot|\\times/g, ' per '],
  [/\\approx/g, ' circa '],
  [/\\le\b|\\leq/g, ' minore o uguale a '],
  [/\\ge\b|\\geq/g, ' maggiore o uguale a '],
  [/\^\{?2\}?/g, ' al quadrato '],
  [/\^\{([^{}]+)\}/g, ' elevato $1 '],
  [/_\{([^{}]+)\}/g, ' $1 '],
  [/_(\w)/g, ' $1 '],
  [/\\[,;!]|\\quad|\\qquad/g, ' '],
  [/\\[a-zA-Z]+/g, ' '],
  [/[{}]/g, ' '],
  [/=/g, ' uguale '],
  [/\+/g, ' più '],
  [/(\s)-(\s)/g, ' meno '],
  [/</g, ' minore di '],
  [/>/g, ' maggiore di '],
  [/°/g, ' gradi '],
];

export function texToSpeech(tex: string): string {
  let s = tex;
  for (let i = 0; i < 3; i++) for (const [re, w] of WORDS) s = s.replace(re, w);
  return s.replace(/\s+/g, ' ').trim();
}

/** testo della lezione (markdown minimale con $…$) → testo da leggere */
export function mdToSpeech(md: string): string {
  return md
    .replace(/\$\$([^$]+)\$\$/g, (_, t) => `. ${texToSpeech(t)}. `)
    .replace(/\$([^$]+)\$/g, (_, t) => ` ${texToSpeech(t)} `)
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

export function speak(md: string, onEnd?: () => void) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(mdToSpeech(md));
  u.lang = 'it-IT';
  const it = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith('it'));
  // preferisce le voci «naturali» o di qualità se il sistema le ha
  u.voice = it.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ?? it[0] ?? null;
  u.rate = 1.0;
  u.onend = () => onEnd?.();
  synth.speak(u);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
