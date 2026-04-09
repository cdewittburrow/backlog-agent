const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { markdownToBlocks } = require('@tryfabric/martian');

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const IDEAS_DIR = path.join(__dirname, '..', 'ideas');

const ARTIFACT_TITLES = {
  'research-brief': 'Research Brief',
  'prd':            'PRD',
  'design':         'Design Doc',
  'tech-spec':      'Technical Spec',
};

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return {
    frontmatter: yaml.load(match[1]) || {},
    body: match[2] || '',
  };
}

function sel(value) {
  return value ? { select: { name: value } } : { select: null };
}

function txt(value) {
  return { rich_text: value ? [{ text: { content: String(value) } }] : [] };
}

async function updateIdeaPage(notionId, fm) {
  await notion.pages.update({
    page_id: notionId,
    properties: {
      Stage:  sel(fm.stage),
      Status: sel(fm.status),
      Type:   sel(fm.type),
      App:    sel(fm.app),
      Notes:  txt(fm.notes),
    },
  });
  console.log(`Updated properties: ${notionId}`);
}

async function upsertArtifactPage(notionId, artifactType, body) {
  const title = ARTIFACT_TITLES[artifactType] || artifactType;
  const blocks = markdownToBlocks(body.trim());

  // Check for existing sub-page with this title
  const { results } = await notion.blocks.children.list({ block_id: notionId });
  const existing = results.find(
    b => b.type === 'child_page' && b.child_page?.title === title
  );

  if (existing) {
    // Delete existing content and replace
    const { results: children } = await notion.blocks.children.list({ block_id: existing.id });
    for (const block of children) {
      await notion.blocks.delete({ block_id: block.id });
    }
    if (blocks.length > 0) {
      await notion.blocks.children.append({ block_id: existing.id, children: blocks });
    }
    console.log(`Updated artifact "${title}" for ${notionId}`);
  } else {
    // Create new sub-page
    await notion.pages.create({
      parent: { page_id: notionId },
      properties: { title: { title: [{ text: { content: title } }] } },
      children: blocks,
    });
    console.log(`Created artifact "${title}" for ${notionId}`);
  }
}

async function main() {
  // Changed files are passed as CLI args by the workflow
  const changedFiles = process.argv.slice(2).filter(f =>
    f.startsWith('ideas/') && f.endsWith('.md') && f !== 'ideas/.gitkeep'
  );

  if (changedFiles.length === 0) {
    console.log('No idea files changed.');
    return;
  }

  for (const file of changedFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) continue; // deleted file, skip

    const basename = path.basename(file, '.md');

    // Artifact files: {notion-id}-{artifact-type}.md
    const artifactMatch = basename.match(/^(.+)-(research-brief|prd|design|tech-spec)$/);

    if (artifactMatch) {
      const [, notionId, artifactType] = artifactMatch;
      const { body } = parseFile(filePath);
      await upsertArtifactPage(notionId, artifactType, body);
    } else {
      // Idea property file: {notion-id}.md
      const { frontmatter } = parseFile(filePath);
      if (frontmatter.notion_id) {
        await updateIdeaPage(frontmatter.notion_id, frontmatter);
      }
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
