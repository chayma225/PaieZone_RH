/**
 * Génère demo-employes.xlsx — données de test pour l'import PaieZone RH
 * Usage : node generate-demo-employes.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Données demo ─────────────────────────────────────────────────────────────
// ⚠  Mets ici les noms EXACTS de tes départements et postes tels qu'ils existent
//    dans ta base. Modifie POSTE_IT si le titre diffère dans ton app.

// Noms exacts tels qu'ils existent en base
const DEPT_RH = 'ressource humaine';
const DEPT_IT = 'informatique';

const POSTE_AGENT = 'agent';
const POSTE_RH = 'rh';
const POSTE_STAGIAIRE = 'stagiaire';
// ressource humaine : agent, rh, stagiaire
// informatique      : rh, stagiaire

const HEADERS = [
  'Matricule',
  'Prénom',
  'Nom',
  'Genre (M/F)',
  'Situation familiale',
  'Nb enfants',
  'Chef famille (O/N)',
  'CIN',
  'Date embauche (DD/MM/YYYY)',
  'Département',
  'Poste',
  'Email pro',
  'Téléphone',
  'Ville',
  'N° CNSS',
  'Type contrat',
  'Salaire base',
  'Date début contrat',
];

const ROWS = [
  // Matricule | Prénom | Nom | Genre | Sit.Fam | Enfants | Chef | CIN | DateEmbauche | Dept | Poste | Email | Tel | Ville | CNSS | Contrat | Salaire | DateDebut
  [
    'E031',
    'Ahmed',
    'Ben Ali',
    'M',
    'MARRIED',
    '2',
    'O',
    '12345631',
    '01/03/2022',
    DEPT_RH,
    POSTE_AGENT,
    'ahmed.benali@paie.tn',
    '+216 20 131 131',
    'Tunis',
    '98765431',
    'CDI',
    '2200',
    '01/03/2022',
  ],
  [
    'E032',
    'Leila',
    'Chaabane',
    'F',
    'SINGLE',
    '0',
    'N',
    '23456732',
    '15/06/2022',
    DEPT_RH,
    POSTE_RH,
    'leila.chaabane@paie.tn',
    '+216 25 232 232',
    'Tunis',
    '87654332',
    'CDI',
    '2800',
    '15/06/2022',
  ],
  [
    'E033',
    'Mohamed',
    'Trabelsi',
    'M',
    'MARRIED',
    '3',
    'O',
    '34567833',
    '01/01/2023',
    DEPT_IT,
    POSTE_RH,
    'm.trabelsi@paie.tn',
    '+216 52 333 333',
    'Sfax',
    '76543233',
    'CDI',
    '1900',
    '01/01/2023',
  ],
  [
    'E034',
    'Fatma',
    'Gharbi',
    'F',
    'MARRIED',
    '1',
    'N',
    '45678934',
    '20/02/2023',
    DEPT_RH,
    POSTE_STAGIAIRE,
    'f.gharbi@paie.tn',
    '+216 29 434 434',
    'Sousse',
    '65432134',
    'CIVP',
    '1200',
    '20/02/2023',
  ],
  [
    'E035',
    'Yassine',
    'Boughamdi',
    'M',
    'SINGLE',
    '0',
    'N',
    '56789035',
    '01/04/2023',
    DEPT_IT,
    POSTE_STAGIAIRE,
    'y.boughamdi@paie.tn',
    '+216 55 535 535',
    'Ariana',
    '54321035',
    'STAGE',
    '1100',
    '01/04/2023',
  ],
  [
    'E036',
    'Rim',
    'Ezzine',
    'F',
    'DIVORCED',
    '2',
    'O',
    '67890136',
    '15/07/2023',
    DEPT_RH,
    POSTE_AGENT,
    'r.ezzine@paie.tn',
    '+216 98 636 636',
    'Monastir',
    '43210936',
    'CDD',
    '1600',
    '15/07/2023',
  ],
  [
    'E037',
    'Tarek',
    'Mabrouk',
    'M',
    'MARRIED',
    '4',
    'O',
    '78901237',
    '01/09/2023',
    DEPT_IT,
    POSTE_RH,
    't.mabrouk@paie.tn',
    '+216 27 737 737',
    'Gabes',
    '32109837',
    'CDI',
    '3100',
    '01/09/2023',
  ],
  [
    'E038',
    'Amira',
    'Khelifi',
    'F',
    'SINGLE',
    '0',
    'N',
    '89012338',
    '10/10/2023',
    DEPT_RH,
    POSTE_RH,
    'a.khelifi@paie.tn',
    '+216 91 838 838',
    'Tunis',
    '21098738',
    'CDI',
    '1950',
    '10/10/2023',
  ],
  [
    'E039',
    'Nizar',
    'Zouari',
    'M',
    'MARRIED',
    '1',
    'N',
    '90123439',
    '01/11/2023',
    DEPT_IT,
    POSTE_STAGIAIRE,
    'n.zouari@paie.tn',
    '+216 22 939 939',
    'Bizerte',
    '10987639',
    'CDD',
    '1800',
    '01/11/2023',
  ],
  [
    'E040',
    'Sonia',
    'Hamdi',
    'F',
    'MARRIED',
    '2',
    'O',
    '01234540',
    '15/01/2024',
    DEPT_RH,
    POSTE_AGENT,
    's.hamdi@paie.tn',
    '+216 54 040 040',
    'Kairouan',
    '09876540',
    'CDI',
    '2100',
    '15/01/2024',
  ],
];

// ── Construction du .xlsx (format Office Open XML minimal) ──────────────────

function escXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildSharedStrings(rows) {
  const all = [HEADERS, ...rows].flat();
  const uniq = [...new Set(all.map(String))];
  const idx = {};
  uniq.forEach((s, i) => {
    idx[s] = i;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${all.length}" uniqueCount="${uniq.length}">
${uniq.map(s => `<si><t xml:space="preserve">${escXml(s)}</t></si>`).join('\n')}
</sst>`;
  return { xml, idx };
}

function colLetter(n) {
  let s = '';
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function buildSheet(rows, ssIdx) {
  const allRows = [HEADERS, ...rows];
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>`;
  allRows.forEach((row, ri) => {
    xml += `<row r="${ri + 1}">`;
    row.forEach((cell, ci) => {
      const col = colLetter(ci);
      const ref = `${col}${ri + 1}`;
      const si = ssIdx[String(cell)];
      xml += `<c r="${ref}" t="s"><v>${si}</v></c>`;
    });
    xml += `</row>`;
  });
  xml += `</sheetData></worksheet>`;
  return xml;
}

// ── Construction ZIP manuel ──────────────────────────────────────────────────

function crc32(buf) {
  const t = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  let c = 0xffffffff;
  for (const b of buf) c = t[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function le2(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}
function le4(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function zipEntry(name, data) {
  const nameBuf = Buffer.from(name, 'utf8');
  const dataBuf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  const crc = crc32(dataBuf);
  const deflated = zlib.deflateRawSync(dataBuf, { level: 6 });

  const local = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    le2(20),
    le2(0),
    le2(8),
    le2(0),
    le2(0),
    le4(crc),
    le4(deflated.length),
    le4(dataBuf.length),
    le2(nameBuf.length),
    le2(0),
    nameBuf,
    deflated,
  ]);

  const central = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x01, 0x02]),
    le2(20),
    le2(20),
    le2(0),
    le2(8),
    le2(0),
    le2(0),
    le4(crc),
    le4(deflated.length),
    le4(dataBuf.length),
    le2(nameBuf.length),
    le2(0),
    le2(0),
    le2(0),
    le2(0),
    le4(0),
    le4(0),
    nameBuf,
  ]);

  return { local, central, localSize: local.length };
}

function buildZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const [name, data] of files) {
    const { local, central, localSize } = zipEntry(name, data);
    // Patch offset dans central (offset 42)
    central.writeUInt32LE(offset, 42);
    locals.push(local);
    centrals.push(central);
    offset += localSize;
  }

  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    le2(0),
    le2(0),
    le2(files.length),
    le2(files.length),
    le4(centralBuf.length),
    le4(offset),
    le2(0),
  ]);

  return Buffer.concat([...locals, centralBuf, eocd]);
}

// ── Fichiers XML requis par le format .xlsx ──────────────────────────────────

const { xml: ssXml, idx: ssIdx } = buildSharedStrings(ROWS);
const sheetXml = buildSheet(ROWS, ssIdx);

const files = [
  [
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml"  ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml"        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/sharedStrings.xml"   ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`,
  ],

  [
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  ],

  [
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Employés" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
  ],

  [
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"     Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>`,
  ],

  ['xl/worksheets/sheet1.xml', sheetXml],
  ['xl/sharedStrings.xml', ssXml],
];

const buf = buildZip(files);
const dest = path.join(__dirname, 'demo-employes.xlsx');
fs.writeFileSync(dest, buf);
console.log(`\n✅ Fichier créé : ${dest}`);
console.log(`   ${ROWS.length} employés · ${HEADERS.length} colonnes\n`);
console.log('Colonnes générées :');
HEADERS.forEach((h, i) => {
  const col = String.fromCharCode(65 + i);
  console.log(`  ${col}  ${h}`);
});
