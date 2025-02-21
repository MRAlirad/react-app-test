import { describe, it, expect } from 'vitest';
import { db } from './mocks/db';

describe('Truthy Test', () => {
	it('should ', async () => {
		const product = db.product.create({name: 'Apple'});
		console.log(product);
	});
});
