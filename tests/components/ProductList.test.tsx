import { it, expect, describe, beforeAll, afterAll } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import ProductList from '../../src/components/ProductList';
import { server } from '../mocks/server';
import { http, HttpResponse, delay } from 'msw';
import { db } from '../mocks/db';
import AllProviders from '../AllProviders';

describe('ProductList', () => {
	const productIds: number[] = [];

	beforeAll(() => {
		[1, 2, 3].forEach(() => {
			const product = db.product.create();
			productIds.push(product.id);
		});
	});

	afterAll(() => {
		db.product.deleteMany({ where: { id: { in: productIds } } });
	});

	it('should render the list of products', async () => {
		render(<ProductList />, { wrapper: AllProviders });

		const items = await screen.findAllByRole('listitem');

		expect(items.length).toBeGreaterThan(0);
	});

	it('should render no product available if no product is found', async () => {
		server.use(http.get('/products', () => HttpResponse.json([])));

		render(<ProductList />, { wrapper: AllProviders });

		const message = await screen.findByText(/no products/i);
		expect(message).toBeInTheDocument();
	});

	it('should render an error message when there is an error', async () => {
		server.use(http.get('/products', () => HttpResponse.error()));

		render(<ProductList />, { wrapper: AllProviders });

		expect(await screen.findByText(/error/i)).toBeInTheDocument();
	});

	it('should render a loading message while fetching data', async () => {
		server.use(
			http.get('/products', async () => {
				await delay();
				HttpResponse.json([]);
			})
		);

		render(<ProductList />, { wrapper: AllProviders });

		expect(await screen.findByText(/loading/i)).toBeInTheDocument();
	});

	it('should remove the loading indicator after data is fetched', async () => {
		render(<ProductList />, { wrapper: AllProviders });

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
	});

	it('should remove the loading indicator if data fetching fails', async () => {
		server.use(http.get('/products', () => HttpResponse.error()));

		render(<ProductList />, { wrapper: AllProviders });

		await waitForElementToBeRemoved(() => screen.getByText(/loading/i));
	});
});
