// Converte dist-single/index.html in un frammento pubblicabile come Artifact (senza doctype/html/head/body):
// il titolo resta in testa, poi stili e script inline, poi il contenuto del body.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const html = readFileSync('dist-single/index.html', 'utf8');
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const title = (head.match(/<title>[^<]*<\/title>/) ?? ['<title>SdC · orale</title>'])[0];
const rest = head.replace(/<meta[^>]*>/g, '').replace(/<title>[^<]*<\/title>/, '');
mkdirSync('dist-artifact', { recursive: true });
writeFileSync('dist-artifact/sdc.html', `${title}\n${body}\n${rest}\n`);
console.log('dist-artifact/sdc.html', (rest.length + body.length) / 1e6, 'MB');
