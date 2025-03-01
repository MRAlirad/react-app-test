import { it, expect, describe, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import ProductForm from '../../src/components/ProductForm';
import AllProviders from '../AllProviders';
import { Category, Product } from '../../src/entities';
import { db } from '../mocks/db';
import userEvent from '@testing-library/user-event';

describe('ProductForm', () => {
	let category: Category;

	beforeAll(() => {
		category = db.category.create();
	});

	afterAll(() => {
		db.category.delete({ where: { id: { equals: category.id } } });
	});

	const renderCompnent = (product?: Product) => {
		render(
			<ProductForm
				product={product}
				onSubmit={vi.fn()}
			/>,
			{ wrapper: AllProviders }
		);

		return {
			waitForFormToLoad: async () => {
				await screen.findByRole('form');
				return {
					nameInput: screen.getByPlaceholderText(/name/i),
					priceInput: screen.getByPlaceholderText(/price/i),
					categoryInput: screen.getByRole('combobox', { name: /category/i }),
					submitButton: screen.getByRole('button'),
				};
			},
		};
	};

	it('should render the form field', async () => {
		const { waitForFormToLoad } = renderCompnent();
		const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

		expect(nameInput).toBeInTheDocument();
		expect(priceInput).toBeInTheDocument();
		expect(categoryInput).toBeInTheDocument();
	});

	it('should populate form fields when editing a product', async () => {
		const product: Product = {
			id: 1,
			name: 'Bread',
			price: 10,
			categoryId: category.id,
		};

		const { waitForFormToLoad } = renderCompnent(product);
		const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

		expect(nameInput).toHaveValue(product.name);
		expect(priceInput).toHaveValue(product.price.toString());
		expect(categoryInput).toHaveTextContent(category.name);
	});

	it('should put focus on the name field', async () => {
		const { waitForFormToLoad } = renderCompnent();

		const { nameInput } = await waitForFormToLoad();

		expect(nameInput).toHaveFocus();
	});

	it.each([
		{
			senario: 'missing',
			errorMessage: /required/i,
		},
		{
			senario: 'longer than 255 characters',
			name: 'a'.repeat(256),
			errorMessage: /255/i,
		},
	])('should display an error if name is $senario', async ({ name, errorMessage }) => {
		const { waitForFormToLoad } = renderCompnent();
		const form = await waitForFormToLoad();

		const user = userEvent.setup();
		if (name !== undefined) await user.type(form.nameInput, name);
		await user.type(form.priceInput, '10');
		await user.click(form.categoryInput);
		const options = screen.getAllByRole('option');
		await user.click(options[0]);
		await user.click(form.submitButton);

		const error = screen.getByRole('alert');
		expect(error).toBeInTheDocument();
		expect(error).toHaveTextContent(errorMessage);
	});

	it.each([
		{
			senario: 'missing',
			errorMessage: /required/i,
		},
		{
			senario: '0',
			price: 0,
			errorMessage: /1/i,
		},
		{
			senario: 'negative',
			price: -1,
			errorMessage: /1/i,
		},
		{
			senario: 'greater than 1000',
			price: 1001,
			errorMessage: /1000/i,
		},
		{
			senario: 'not a number',
			price: 'a',
			errorMessage: /required/i,
		},
	])('should display an error if price is $senario', async ({ price, errorMessage }) => {
		const { waitForFormToLoad } = renderCompnent();
		const form = await waitForFormToLoad();

		const user = userEvent.setup();
		await user.type(form.nameInput, 'Bread');
		if (price !== undefined) await user.type(form.priceInput, price.toString());
		await user.click(form.categoryInput);
		const options = screen.getAllByRole('option');
		await user.click(options[0]);
		await user.click(form.submitButton);

		const error = screen.getByRole('alert');
		expect(error).toBeInTheDocument();
		expect(error).toHaveTextContent(errorMessage);
	});
});
