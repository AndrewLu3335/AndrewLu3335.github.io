import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageNames = ['index.html', 'playwright-ai.html'];

function read(relativePath) {
  const absolutePath = resolve(root, relativePath);
  assert.ok(existsSync(absolutePath), `${relativePath} must exist`);
  return readFileSync(absolutePath, 'utf8');
}

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:#|https?:|mailto:|tel:)/.test(value))
    .map((value) => value.split('#')[0].split('?')[0])
    .filter(Boolean);
}

test('required static files exist', () => {
  for (const relativePath of [...pageNames, 'styles.css', 'site.js']) {
    assert.ok(existsSync(resolve(root, relativePath)), `${relativePath} must exist`);
  }
});

test('pages are English-only and use approved project terminology', () => {
  for (const pageName of pageNames) {
    const html = read(pageName);
    assert.match(html, /<html[^>]+lang="en"/);
    assert.doesNotMatch(html, /[\u4e00-\u9fff]/);
    assert.doesNotMatch(html, /Case Study|QA Casebook/i);
  }
});

test('homepage preserves verified experience, education, and project relationship', () => {
  const html = read('index.html');

  for (const requiredText of [
    'QA Automation Engineer, Automation &amp; Testing Infrastructure',
    'Aug 2021 - Aug 2024',
    '40%',
    'millions of daily active users',
    'M.Sc. in Computational Sciences, May 2026',
    'Cumulative average: 9.40 / 10.0',
    'B.Eng. in Communication Engineering, June 2021',
    'Scholarship recipient',
    'Playwright AI QA Framework',
    'System Under Test: Lace Up',
  ]) {
    assert.ok(html.includes(requiredText), `index.html must include: ${requiredText}`);
  }

  assert.equal((html.match(/Featured QA Automation Project/g) ?? []).length, 1);
});

test('project page documents implemented Lace Up and AI coverage', () => {
  const html = read('playwright-ai.html');

  for (const requiredText of [
    'Public health status',
    'Unauthenticated access control',
    'Local E2E Session creation',
    'Authenticated run-list access',
    'Authenticated UI/API run-list consistency',
    'Unauthenticated private-route redirects',
    'Test code',
    'Application',
    'Test data',
    'Environment',
    'Network',
    'Flaky behavior',
    'Playwright owns every deterministic pass/fail decision',
  ]) {
    assert.ok(html.includes(requiredText), `playwright-ai.html must include: ${requiredText}`);
  }

  assert.match(html, /github\.com\/AndrewLu3335\/playwright-ai-qa-framework/);
  assert.match(html, /github\.com\/AndrewLu3335\/lace_up/);
});

// Protects the public contract for label-routed reports and user-defined JSON templates.
test('project page documents extensible report template routing', () => {
  const projectHtml = read('playwright-ai.html');
  const homeHtml = read('index.html');

  for (const requiredText of [
    'Label selects template',
    'Metadata controls execution',
    'JSON template controls fields',
    'report-templates.json',
    'api, ui, cross-layer, pagination, auth, and failure-analysis',
    'smoke and regression never change report structure',
  ]) {
    assert.ok(projectHtml.includes(requiredText), `playwright-ai.html must include: ${requiredText}`);
  }

  assert.ok(homeHtml.includes('label-routed JSON report templates'));
});

// Protects the implemented API report structure and its evidence-based claims.
test('project page presents traceable API execution results', () => {
  const html = read('playwright-ai.html');

  for (const anchor of [
    'api-objective',
    'api-endpoints',
    'api-scenarios',
    'api-evidence',
    'api-results',
    'api-risks',
  ]) {
    assert.match(html, new RegExp(`(?:id|href)="(?:#)?${anchor}"`));
  }

  for (const requiredText of [
    'API Test Results',
    'GET /api/health/',
    'GET /api/runs/',
    'POST /api/test/login/',
    '4 / 4 passed',
    'Shallow liveness check',
    'Risk conclusion',
    'Write operations are not covered',
    'npm run test:api',
  ]) {
    assert.ok(html.includes(requiredText), `playwright-ai.html must include: ${requiredText}`);
  }
});

test('project page embeds the failure intelligence walkthrough without autoplay', () => {
  const html = read('playwright-ai.html');

  assert.ok(existsSync(resolve(root, 'media/playwright-failure-flow.mp4')));
  assert.match(html, /<video[^>]+controls[^>]+muted[^>]+playsinline/);
  assert.match(html, /preload="none"/);
  assert.match(html, /poster="images\/playwright-failure-flow-poster\.png"/);
  assert.match(html, /src="media\/playwright-failure-flow\.mp4"/);
  assert.doesNotMatch(html, /<video[^>]+autoplay/);
});

test('all local page references resolve to files', () => {
  for (const pageName of pageNames) {
    const html = read(pageName);
    for (const reference of localReferences(html)) {
      assert.ok(existsSync(resolve(root, reference)), `${pageName} references missing file: ${reference}`);
    }
  }
});

test('pages do not expose credential material', () => {
  const html = pageNames.map(read).join('\n');
  assert.doesNotMatch(html, /(?:password|secret|api[_-]?key|access[_-]?token)\s*[:=]/i);
});

test('site does not publish resume files or links', () => {
  const html = pageNames.map(read).join('\n');

  assert.doesNotMatch(html, /resume|résumé/i);
  assert.equal(existsSync(resolve(root, 'resume.html')), false);
  assert.equal(existsSync(resolve(root, 'Resume_JingshengLu.pdf')), false);
});
