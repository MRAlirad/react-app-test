import { describe, it, expect } from 'vitest';

describe('Truthy Test', () => {
	it('should verify that 1 is truthy', async () => {
		const response = await fetch('/categories');
		const data = await response.json();
		console.log(data);
		expect(data).toHaveLength(3);
	});
});
