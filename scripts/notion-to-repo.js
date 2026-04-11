const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const IDEAS_DIR = path.join(__dirname, '..', 'ideas');

function getProp(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case 'title':       return prop.title?.[0]?.plain_text || null;
    case 'rich_text':   return prop.rich_text?.[0]?.plain_text || null;
    case 'select':      return prop.select?.name || null;
    case 'created_time':return prop.created_time || null;
    default:            return null;
  }
}

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return {
    frontmatter: yaml.load(match[1]) || {},
    body: match[2] || '',
  };
}

function writeFile(filePath, frontmatter, body = '') {
  const fm = yaml.dump(frontmatter, { lineWidth: -1 }).trimEnd();
  fs.writeFileSync(filePath, `---
${fm}
---
${body}`, 'utf8');
}

async function main() {
  if (!fs.existsSync(IDEAS_DIR)) fs.mkdirSync(IDEAS_DIR, { recursive: true });

  const pages = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  let created = 0, updated = 0;

  for (const page of pages) {
    const id = page.id;
    const p = page.properties;
    const filePath = path.join(IDEAS_DIR, `${id}.md`);

    if (!fs.existsSync(filePath)) {
      // New idea — create file with all properties, applying defaults
      writeFile(filePath, {
        notion_id: id,
        name:    getProp(p.Name),
        type:    getProp(p.Type),
        app:     getProp(p.App),
        stage:   getProp(p.Stage)  || 'Intake',
        status:  getProp(p.Status) || 'Pending Review',
        notes:   getProp(p.Notes),
        created: getProp(p.Created),
      });
      created++;
    } else {
      // Existing idea — sync Chase-owned fields (name, status, notes, stage)
      // type and app remain Claude-owned
      const { frontmatter, body } = parseFile(filePath);
      const notionStage = getProp(p.Stage);
      frontmatter.name   = getProp(p.Name);
      frontmatter.status = getProp(p.Status) || frontmatter.status;
      frontmatter.notes  = getProp(p.Notes);
      // Only update stage if Notion has a non-null value — allows manual stage overrides
      if (notionStage) frontmatter.stage = notionStage;
      writeFile(filePath, frontmatter, body);
      updated++;
    }
  }

  console.log(`Synced: ${created} created, ${updated} updated`);
}

main().catch(err => { console.error(err); process.exit(1); });
