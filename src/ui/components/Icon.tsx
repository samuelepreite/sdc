/** Icone a tratto (24×24, stroke = currentColor). Disegnate a mano: nessuna libreria esterna. */
const P: Record<string, string> = {
  oggi: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  studia: 'M8 5.5v13l10.5-6.5z',
  moduli: 'M4 7h16M4 12h16M4 17h10',
  progressi: 'M5 20V12M10 20V6M15 20v-9M20 20V4',
  piano: 'M4 6.5h16v13.5H4zM4 10.5h16M8.5 4v4M15.5 4v4',
  formulario: 'M7 4.5h10.5V20H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2zM5 17a2 2 0 0 1 2-2h10.5',
  fonti: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM12 11v5M12 8v.01',
  impostazioni: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  altro: 'M5 12h.01M12 12h.01M19 12h.01',
  lucchetto: 'M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9h-13z',
  ok: 'M5 12.5 10 17l9-10',
  freccia: 'M5 12h13M13 6.5l5.5 5.5-5.5 5.5',
  indietro: 'M19 12H6M11 6.5 5.5 12l5.5 5.5',
  tempo: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15zM12 8v4.5l3 2',
  fiamma: 'M12 3.5c3 3.5 5.5 6 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2 1-3.5 2.5-5 .3 1.6 1 2.6 2 3 0-2.7.3-5 1-7.5z',
  libro: 'M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5V19c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5zM12 6v13.5',
  prova: 'M7 3.5h7.5L19 8v12.5H7zM14.5 3.5V8H19M10 12.5h6M10 16h6',
  orale: 'M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3zM6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5M9 20.5h6',
  modello: 'M12 3.5 19.5 7.5v9L12 20.5 4.5 16.5v-9zM12 12l7.5-4.5M12 12v8.5M12 12 4.5 7.5',
};

export function Icon({ name, size = 20, className }: { name: keyof typeof P | string; size?: number; className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] ?? P.altro} />
    </svg>
  );
}

/**
 * Marchio: il cubetto elementare che si deforma (il soggetto del corso): un quadrato e la sua immagine sotto un taglio.
 * Durante la sincronizzazione il taglio oscilla piano.
 */
export function Brand({ size = 28, busy = false }: { size?: number; busy?: boolean }) {
  return (
    <svg className={`brandmark ${busy ? 'busy' : ''}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="9" width="16" height="16" className="bm-ghost" />
      <path d="M6 25 L22 25 L27 9 L11 9 Z" className="bm-shear" />
      <path d="M6 25 L11 9" className="bm-edge" />
    </svg>
  );
}
