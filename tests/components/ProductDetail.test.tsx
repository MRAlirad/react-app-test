import { it, expect, describe, beforeAll, afterAll } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import ProductDetail from '../../src/components/ProductDetail';
// import { products } from '../mocks/data';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { db } from '../mocks/db';
import AllProviders from '../AllProviders';

describe('ProductDetail', () => {
	let productId: number;

	beforeAll(() => {
		const product = db.product.create();
		productId = product.id;
	});

	afterAll(() => {
		db.product.delete({ where: { id: { equals: productId } } });
	});

	it('should render the product details', async () => {
		const product = db.product.findFirst({ where: { id: { equals: productId } } });
		render(<ProductDetail productId={productId} />, { wrapper: AllProviders });

		expect(await screen.findByText(new RegExp(product!.name))).toBeInTheDocument();
		expect(await screen.findByText(new RegExp(product!.price.toString()))).toBeInTheDocument();
	});

	it('should render message if product not found', async () => {
		server.use(http.get('/products/1', () => HttpResponse.json(null)));
		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		expect(await screen.findByText(/not found/i)).toBeInTheDocument();
	});

	it('should render an error for invalid id', async () => {
		render(<ProductDetail productId={0} />, { wrapper: AllProviders });

		expect(await screen.findByText(/invalid/i)).toBeInTheDocument();
	});

	it('should render an error if data fetching fails', async () => {
		server.use(http.get('/products/1', () => HttpResponse.error()));

		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		expect(await screen.findByText(/error/i)).toBeInTheDocument();
	});

	it('should remove the loading indicator after data is fetched', async () => {
		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
	});

	it('should remove the loading indicator if data fetching fails', async () => {
		server.use(http.get('/products', () => HttpResponse.error()));

		render(<ProductDetail productId={1} />, { wrapper: AllProviders });

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
	});
});
