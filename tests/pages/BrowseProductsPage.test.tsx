import { it, expect, describe, beforeAll, afterAll } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import userEvent from '@testing-library/user-event';
import { db } from '../mocks/db';
import { Category, Product } from '../../src/entities';
import { CartProvider } from '../../src/providers/CartProvider';
import { simulateDelay, simulateError } from '../utils';

describe('BrowseProductsPage', () => {
	const categories: Category[] = [];
	const products: Product[] = [];

	beforeAll(() => {
		[1, 2].forEach((item) => {
			const category = db.category.create({name: `Category ${item}`});
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

	const renderComponent = () => {
		render(
			<CartProvider>
				<Theme>
					<BrowseProducts />
				</Theme>
			</CartProvider>
		);

		return {
			getProductsSkeleton: () => screen.queryByRole('progressbar', { name: /products/i }),
			getCategoriesSkeleton: () => screen.getByRole('progressbar', { name: /categories/i }),
			getCategoriesCoboBox: () => screen.queryByRole('combobox'),
		};
	};

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

	it.skip('should render categories', async () => {
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

	it.skip('should render products', async () => {
		const { getProductsSkeleton } = renderComponent();

		await waitForElementToBeRemoved(getProductsSkeleton);

		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		});
	});

	it('should filter products by category', async () => {
		const { getCategoriesSkeleton, getCategoriesCoboBox } = renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);
		const combobox = getCategoriesCoboBox();
		const user = userEvent.setup();
		await user.click(combobox!);

		const selectedCategory = categories[0];
		const option = screen.getByRole('option', { name: selectedCategory.name });
		await user.click(option);

		const products = db.product.findMany({ where: { categoryId: { equals: selectedCategory.id } } });
		const rows = screen.getAllByRole('row');
		const dataRows = rows.slice(1);
		expect(dataRows).toHaveLength(products.length);
		
		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		})
	});
	it('should filter products by category', async () => {
		const { getCategoriesSkeleton, getCategoriesCoboBox } = renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);
		const combobox = getCategoriesCoboBox();
		const user = userEvent.setup();
		await user.click(combobox!);

		const selectedCategory = categories[0];
		const option = screen.getByRole('option', { name: selectedCategory.name });
		await user.click(option);

		const products = db.product.findMany({ where: { categoryId: { equals: selectedCategory.id } } });
		const rows = screen.getAllByRole('row');
		const dataRows = rows.slice(1);
		expect(dataRows).toHaveLength(products.length);
		
		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		})
	});
	it('should render all products if All category is selected', async () => {
		const { getCategoriesSkeleton, getCategoriesCoboBox } = renderComponent();

		await waitForElementToBeRemoved(getCategoriesSkeleton);
		const combobox = getCategoriesCoboBox();
		const user = userEvent.setup();
		await user.click(combobox!);

		const option = screen.getByRole('option', { name: /all/i });
		await user.click(option);

		const products = db.product.getAll()
		const rows = screen.getAllByRole('row');
		const dataRows = rows.slice(1);
		expect(dataRows).toHaveLength(products.length);
		
		products.forEach(product => {
			expect(screen.getByText(product.name)).toBeInTheDocument();
		})
	});
});
