import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const SKILL_IMPORT_EXTENSION = 'io.modelcontextprotocol/skills';
export const SKILL_CATALOG_VERSION = '0.1.0';

const SKILL_DEFINITIONS = [
  {
    name: 'cognistration-agentic-routing',
    uri: 'skill://cognistration/cognistration-agentic-routing/SKILL.md',
    relativePath: 'skills/cognistration-agentic-routing/SKILL.md',
    fileUrl: new URL('../../skills/cognistration-agentic-routing/SKILL.md', import.meta.url)
  },
  {
    name: 'cognistration-tone-orchestration',
    uri: 'skill://cognistration/cognistration-tone-orchestration/SKILL.md',
    relativePath: 'skills/cognistration-tone-orchestration/SKILL.md',
    fileUrl: new URL('../../skills/cognistration-tone-orchestration/SKILL.md', import.meta.url)
  },
  {
    name: 'cognistration-account-safety',
    uri: 'skill://cognistration/cognistration-account-safety/SKILL.md',
    relativePath: 'skills/cognistration-account-safety/SKILL.md',
    fileUrl: new URL('../../skills/cognistration-account-safety/SKILL.md', import.meta.url)
  },
  {
    name: 'cognistration-agent-evaluation',
    uri: 'skill://cognistration/cognistration-agent-evaluation/SKILL.md',
    relativePath: 'skills/cognistration-agent-evaluation/SKILL.md',
    fileUrl: new URL('../../skills/cognistration-agent-evaluation/SKILL.md', import.meta.url)
  }
];

function readSkillText(definition) {
  try {
    return readFileSync(definition.fileUrl, 'utf8');
  } catch {
    return readFileSync(path.join(process.cwd(), definition.relativePath), 'utf8');
  }
}

function parseFrontmatter(text) {
  const match = String(text).match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) throw new Error('Skill frontmatter is missing.');

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) frontmatter[key] = value;
  }
  if (!frontmatter.name || !frontmatter.description) throw new Error('Skill frontmatter needs name and description.');
  return frontmatter;
}

function digest(text) {
  return `sha256:${createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex')}`;
}

function buildSkillEntry(definition) {
  const text = readSkillText(definition);
  const frontmatter = parseFrontmatter(text);
  return {
    uri: definition.uri,
    frontmatter,
    resources: [{ uri: definition.uri, digest: digest(text) }]
  };
}

function catalog() {
  return SKILL_DEFINITIONS.map(buildSkillEntry);
}

function cursorOffset(cursor) {
  if (cursor == null || cursor === '') return 0;
  if (!/^\d+$/.test(String(cursor))) throw new Error('Skill list cursor is invalid.');
  const offset = Number(cursor);
  if (offset > SKILL_DEFINITIONS.length) throw new Error('Skill list cursor is out of range.');
  return offset;
}

export function listSkills({ cursor } = {}) {
  const entries = catalog();
  const offset = cursorOffset(cursor);
  const pageSize = 5;
  const skills = entries.slice(offset, offset + pageSize);
  const nextOffset = offset + skills.length;
  return {
    skills,
    ...(nextOffset < entries.length ? { nextCursor: String(nextOffset) } : {})
  };
}

export function getSkill(uri) {
  const entry = catalog().find((skill) => skill.uri === uri);
  return entry || null;
}

export function readSkillResource(uri) {
  const definition = SKILL_DEFINITIONS.find((item) => item.uri === uri);
  if (!definition) return null;
  return {
    uri,
    mimeType: 'text/markdown',
    text: readSkillText(definition)
  };
}

export function skillCatalogSummary() {
  return {
    extension: SKILL_IMPORT_EXTENSION,
    version: SKILL_CATALOG_VERSION,
    count: SKILL_DEFINITIONS.length,
    uris: SKILL_DEFINITIONS.map((definition) => definition.uri)
  };
}
