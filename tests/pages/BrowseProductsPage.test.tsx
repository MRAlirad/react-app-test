import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Category, Product } from '../../src/entities';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import AllProviders from '../AllProviders';
import { db, getProductByCategory } from '../mocks/db';
import { simulateDelay, simulateError } from '../utils';

describe('BrowseProductsPage', () => {
	const categories: Category[] = [];
	const products: Product[] = [];

	beforeAll(() => {
		[1, 2].forEach(item => {
			const category = db.category.create({ name: `Category ${item}` });
			categories.push(category);
			[1, 2].forEach(() => {
				products.push(db.product.create({ categoryId: category.id }));
			});
		});
	});

	afterAll(() => {
		const categoryIds = categories.map(c => c.id);
		db.category.deleteMany({
			where: { id: { in: categoryIds } },
		});

		const productIds = products.map(p => p.id);
		db.product.deleteMany({
			where: { id: { in: productIds } },
		});
	});

	it('should show a loading skeleton when fetching categories', () => {
		simulateDelay('/categories');

		const { getCategoriesSkeleton } = renderComponent();

		expect(getCategoriesSkeleton()).toBeInTheDocument();
	});

	it('should hide the loading skeleton after categories are fetched', async () => {
		const { getCategoriesSkeleton } = renderComponent();
		await waitForElementToBeRemoved(getCategoriesSkeleton);
	});

	it('should show a loading skeleton when fetching products', () => {
		simulateDelay('/products');

		const { getProductsSkeleton } = renderComponent();

		expect(getProductsSkeleton()).toBeInTheDocument();
	});

	it('should hide the loading skeleton after products are fetched', async () => {
		const { getProductsSkeleton } = renderComponent();
		await waitForElementToBeRemoved(getProductsSkeleton);
	});

	it('should not render an error if categories can not be fetched', async () => {
		simulateError('/categories');

		const { getCategoriesSkeleton, getCategoriesCoboBox } = renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);

		expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		expect(getCategoriesCoboBox()).not.toBeInTheDocument();
	});

	it('should render an error if products can not be fetched', async () => {
		simulateError('/products');

		renderComponent();

		expect(await screen.findByText(/error/i)).toBeInTheDocument();
	});

	it('should render categories', async () => {
		const { getCategoriesSkeleton, getCategoriesCoboBox } = renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);

		const combobox = getCategoriesCoboBox();
		expect(combobox).toBeInTheDocument();

		const user = userEvent.setup();
		await user.click(combobox!);

		expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument();
		categories.forEach(category => {
			expect(screen.getByRole('option', { name: category.name })).toBeInTheDocument();
		});
	});

	it('should render products', async () => {
		const { getProductsSkeleton } = renderComponent();

		await waitForElementToBeRemoved(getProductsSkeleton);

		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		});
	});

	it('should filter products by category', async () => {
		const { selectCategory, expectProductsToBeInTheDocument } = renderComponent();

		const selectedCategory = categories[0];
		await selectCategory(selectedCategory.name);

		const products = getProductByCategory(selectedCategory.id);
		expectProductsToBeInTheDocument(products);
	});

	it('should render all products if All category is selected', async () => {
		const { selectCategory, expectProductsToBeInTheDocument } = renderComponent();

		await selectCategory(/all/i);

		const products = db.product.getAll();
		expectProductsToBeInTheDocument(products);
	});
});

const renderComponent = () => {
	render(<BrowseProducts />, { wrapper: AllProviders });

	const getProductsSkeleton = () => screen.queryByRole('progressbar', { name: /products/i });
	const getCategoriesSkeleton = () => screen.getByRole('progressbar', { name: /categories/i });
	const getCategoriesCoboBox = () => screen.queryByRole('combobox');
	const selectCategory = async (name: RegExp | string) => {
		await waitForElementToBeRemoved(getCategoriesSkeleton);
		const combobox = getCategoriesCoboBox();
		const user = userEvent.setup();
		await user.click(combobox!);

		const option = screen.getByRole('option', { name });
		await user.click(option);
	};
	const expectProductsToBeInTheDocument = (products: Product[]) => {
		const rows = screen.getAllByRole('row');
		const dataRows = rows.slice(1);
		expect(dataRows).toHaveLength(products.length);

		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		});
	};

	return {
		getProductsSkeleton,
		getCategoriesSkeleton,
		getCategoriesCoboBox,
		selectCategory,
		expectProductsToBeInTheDocument,
	};
};
