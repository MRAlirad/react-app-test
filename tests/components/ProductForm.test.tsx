import { it, expect, describe, beforeAll, afterAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductForm from '../../src/components/ProductForm';
import AllProviders from '../AllProviders';
import { Category, Product } from '../../src/entities';
import { db } from '../mocks/db';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'react-hot-toast';

describe('ProductForm', () => {
	let category: Category;

	beforeAll(() => {
		category = db.category.create();
	});

	afterAll(() => {
		db.category.delete({ where: { id: { equals: category.id } } });
	});

	const renderComponent = (product?: Product) => {
		const onSubmit = vi.fn();

		render(
			<>
				<ProductForm
					product={product}
					onSubmit={onSubmit}
				/>
				<Toaster />
			</>,
			{ wrapper: AllProviders }
		);

		return {
			onSubmit,
			expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
				const error = screen.getByRole('alert');
				expect(error).toBeInTheDocument();
				expect(error).toHaveTextContent(errorMessage);
			},
			waitForFormToLoad: async () => {
				await screen.findByRole('form');

				const nameInput = screen.getByPlaceholderText(/name/i);
				const priceInput = screen.getByPlaceholderText(/price/i);
				const categoryInput = screen.getByRole('combobox', { name: /category/i });
				const submitButton = screen.getByRole('button');

				type FormData = {
					[K in keyof Product]: any;
				};

				const validData: FormData = {
					id: 1,
					categoryId: category.id,
					name: 'Bread',
					price: 10,
				};

				const fill = async (product: FormData) => {
					const user = userEvent.setup();

					if (product.name !== undefined) await user.type(nameInput, product.name);

					if (product.price !== undefined) await user.type(priceInput, product.price.toString());

					await user.tab();
					await user.click(categoryInput);
					const options = screen.getAllByRole('option');
					await user.click(options[0]);
					await user.click(submitButton);
				};

				return {
					nameInput,
					priceInput,
					categoryInput,
					submitButton,
					fill,
					validData,
				};
			},
		};
	};

	it('should render the form field', async () => {
		const { waitForFormToLoad } = renderComponent();
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

		const { waitForFormToLoad } = renderComponent(product);
		const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

		expect(nameInput).toHaveValue(product.name);
		expect(priceInput).toHaveValue(product.price.toString());
		expect(categoryInput).toHaveTextContent(category.name);
	});

	it('should put focus on the name field', async () => {
		const { waitForFormToLoad } = renderComponent();

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
		const { waitForFormToLoad, expectErrorToBeInTheDocument } = renderComponent();
		const form = await waitForFormToLoad();

		await form.fill({ ...form.validData, name });

		expectErrorToBeInTheDocument(errorMessage);
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
		const { waitForFormToLoad, expectErrorToBeInTheDocument } = renderComponent();
		const form = await waitForFormToLoad();
		await form.fill({ ...form.validData, price });

		expectErrorToBeInTheDocument(errorMessage);
	});

	it('should call onSubmit with the correct data', async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();

		const form = await waitForFormToLoad();
		await form.fill(form.validData);

		const { id, ...formData } = form.validData;
		expect(onSubmit).toHaveBeenCalledWith(formData);
	});

	it('should display a toast if submission fails', async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockRejectedValue({});

		const form = await waitForFormToLoad();
		await form.fill(form.validData);

		const toast = await screen.findByRole('status');
		expect(toast).toBeInTheDocument();
		expect(toast).toHaveTextContent(/error/i);
	});

	it('should disable the submit button upon submission', async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockReturnValue(new Promise(() => {}));

		const form = await waitForFormToLoad();
		await form.fill(form.validData);

		expect(form.submitButton).toBeDisabled();
	});

	it('should re-enable the submit button after submission', async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockResolvedValue({});

		const form = await waitForFormToLoad();
		await form.fill(form.validData);

		expect(form.submitButton).not.toBeDisabled();
	});
	it('should re-enable the submit button after submission', async () => {
		const { waitForFormToLoad, onSubmit } = renderComponent();
		onSubmit.mockRejectedValue('error');

		const form = await waitForFormToLoad();
		await form.fill(form.validData);

		expect(form.submitButton).not.toBeDisabled();
	});
});
