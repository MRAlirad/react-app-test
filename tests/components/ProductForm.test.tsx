import { it, expect, describe, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import ProductForm from '../../src/components/ProductForm';
import AllProviders from '../AllProviders';

describe('ProductForm', () => {
	it('should render the form field', async () => {
		render(<ProductForm onSubmit={vi.fn()} />, { wrapper: AllProviders });

		await screen.findByRole('form');
		// await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

		expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();
		expect(screen.getByRole('combobox', {name: /category/i})).toBeInTheDocument();
	});
});
