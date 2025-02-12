import { render, screen } from '@testing-library/react';
import { it, expect, describe, vi } from 'vitest';
import OrderStatusSelector from '../../src/components/OrderStatusSelector';
import { Theme } from '@radix-ui/themes';
import userEvent from '@testing-library/user-event';

describe('OrderStatusSelector', () => {
	it('should render new as the default value', () => {
		render(
			<Theme>
				<OrderStatusSelector onChange={vi.fn()} />
			</Theme>
		);

		const button = screen.getByRole('combobox');
		expect(button).toHaveTextContent(/new/i);
	});
	it('should render currect statuses', async () => {
		render(
			<Theme>
				<OrderStatusSelector onChange={vi.fn()} />
			</Theme>
		);

		const button = screen.getByRole('combobox');
		const user = userEvent.setup();
		await user.click(button);

		const options = screen.getAllByRole('option');

		expect(options).toHaveLength(3);

		const labels = options.map(option => option.textContent);

		expect(labels).toEqual(['New', 'Processed', 'Fulfilled']);
	});
});
