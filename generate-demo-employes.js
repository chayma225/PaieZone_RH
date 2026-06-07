/**
 * Génère demo-employes.xlsx — données de test pour l'import PaieZone RH
 * Usage : node generate-demo-employes.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ── Données demo (10 employés tunisiens réalistes) ──────────────────────────

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
    'E001',
    'Ahmed',
    'Ben Ali',
    'M',
    'MARRIED',
    '2',
    'O',
    '12345678',
    '01/03/2022',
    'Informatique',
    'Développeur Full-Stack',
    'ahmed.benali@atlas.tn',
    '+216 20 100 100',
    'Tunis',
    '98765432',
    'CDI',
    '2200',
    '01/03/2022',
  ],
  [
    'E002',
    'Leila',
    'Chaabane',
    'F',
    'SINGLE',
    '0',
    'N',
    '23456789',
    '15/06/2022',
    'Ressources Humaines',
    'Responsable RH',
    'leila.chaabane@atlas.tn',
    '+216 25 200 200',
    'Tunis',
    '87654321',
    'CDI',
    '2800',
    '15/06/2022',
  ],
  [
    'E003',
    'Mohamed',
    'Trabelsi',
    'M',
    'MARRIED',
    '3',
    'O',
    '34567890',
    '01/01/2023',
    'Finance',
    'Comptable',
    'm.trabelsi@atlas.tn',
    '+216 52 300 300',
    'Sfax',
    '76543210',
    'CDI',
    '1900',
    '01/01/2023',
  ],
  [
    'E004',
    'Fatma',
    'Gharbi',
    'F',
    'MARRIED',
    '1',
    'N',
    '45678901',
    '20/02/2023',
    'Commercial',
    'Chargée de clientèle',
    'f.gharbi@atlas.tn',
    '+216 29 400 400',
    'Sousse',
    '65432109',
    'CDI',
    '1750',
    '20/02/2023',
  ],
  [
    'E005',
    'Yassine',
    'Boughamdi',
    'M',
    'SINGLE',
    '0',
    'N',
    '56789012',
    '01/04/2023',
    'Informatique',
    'Développeur Backend',
    'y.boughamdi@atlas.tn',
    '+216 55 500 500',
    'Ariana',
    '54321098',
    'CDI',
    '2100',
    '01/04/2023',
  ],
  [
    'E006',
    'Rim',
    'Ezzine',
    'F',
    'DIVORCED',
    '2',
    'O',
    '67890123',
    '15/07/2023',
    'Marketing',
    'Chargée de communication',
    'r.ezzine@atlas.tn',
    '+216 98 600 600',
    'Monastir',
    '43210987',
    'CDD',
    '1600',
    '15/07/2023',
  ],
  [
    'E007',
    'Tarek',
    'Mabrouk',
    'M',
    'MARRIED',
    '4',
    'O',
    '78901234',
    '01/09/2023',
    'Production',
    'Chef de production',
    't.mabrouk@atlas.tn',
    '+216 27 700 700',
    'Gabes',
    '32109876',
    'CDI',
    '3100',
    '01/09/2023',
  ],
  [
    'E008',
    'Amira',
    'Khelifi',
    'F',
    'SINGLE',
    '0',
    'N',
    '89012345',
    '10/10/2023',
    'Informatique',
    'Développeuse Frontend',
    'a.khelifi@atlas.tn',
    '+216 91 800 800',
    'Tunis',
    '21098765',
    'CDI',
    '1950',
    '10/10/2023',
  ],
  [
    'E009',
    'Nizar',
    'Zouari',
    'M',
    'MARRIED',
    '1',
    'N',
    '90123456',
    '01/11/2023',
    'Finance',
    'Analyste financier',
    'n.zouari@atlas.tn',
    '+216 22 900 900',
    'Bizerte',
    '10987654',
    'CDD',
    '1800',
    '01/11/2023',
  ],
  [
    'E010',
    'Sonia',
    'Hamdi',
    'F',
    'MARRIED',
    '2',
    'O',
    '01234567',
    '15/01/2024',
    'Ressources Humaines',
    'Assistante RH',
    's.hamdi@atlas.tn',
    '+216 54 010 010',
    'Kairouan',
    '09876543',
    'CIVP',
    '1200',
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
