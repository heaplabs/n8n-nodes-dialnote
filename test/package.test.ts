import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

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

	it('names the public repository the package is published from, with an author email', () => {
		expect(pkg.repository.url).toBe('https://github.com/heaplabs/n8n-nodes-dialnote.git');
		expect(pkg.author.email).not.toBe('');
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
