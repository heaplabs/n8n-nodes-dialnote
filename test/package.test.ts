import { describe, expect, it } from 'vitest';
import pkg from '../package.json';
// Vite's raw import: the strict community lint bans node:fs even in tests.
import changelog from '../CHANGELOG.md?raw';

// The n8n verification guidelines, pinned so a future edit cannot drift out of them.
describe('package manifest', () => {
	it('carries the community-node keyword and the MIT license', () => {
		expect(pkg.keywords).toContain('n8n-community-node-package');
		expect(pkg.license).toBe('MIT');
	});

	it('has no runtime dependencies', () => {
		expect('dependencies' in pkg).toBe(false);
		expect(Object.keys(pkg.peerDependencies)).toEqual(['n8n-workflow']);
	});

	it('points at the public release mirror, which npm provenance requires to match exactly', () => {
		// The source lives in the private monorepo; the mirror is what publish.yml builds from.
		expect(pkg.repository.url).toBe('git+https://github.com/heaplabs/n8n-nodes-dialnote.git');
		expect('directory' in pkg.repository).toBe(false);
		expect(pkg.bugs.url).toBe('https://github.com/heaplabs/n8n-nodes-dialnote/issues');
		expect(pkg.homepage).toMatch(/^https:\/\/dialnote\.com\//);
		expect(pkg.author.email).not.toBe('');
	});

	it('ships dist only, so the publish workflow and release script never reach npm', () => {
		expect(pkg.files).toEqual(['dist']);
	});

	it('has the version the changelog announces, which is also the mirror tag', () => {
		const [, latest] = /^## (\d+\.\d+\.\d+)/m.exec(changelog) ?? [];
		expect(pkg.version).toBe(latest);
	});

	it('lists only nodes and credentials that exist after a build and export a class', async () => {
		for (const file of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
			// Resolves against this file; fails loudly if `npm run build` was not run first.
			const mod: Record<string, unknown> = await import(`../${file}`);
			expect(
				Object.values(mod).some((v) => typeof v === 'function'),
				`${file} exports no class`,
			).toBe(true);
		}
	});
});
