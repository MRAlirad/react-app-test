import { render, screen } from '@testing-library/react';
import { it, expect, describe, vi } from 'vitest';
import OrderStatusSelector from '../../src/components/OrderStatusSelector';
import { Theme } from '@radix-ui/themes';
import userEvent from '@testing-library/user-event';

describe('OrderStatusSelector', () => {
	const renderComponent = () => {
		render(
			<Theme>
				<OrderStatusSelector onChange={vi.fn()} />
			</Theme>
		);

		return {
			trigger: screen.getByRole('combobox'),
			getOptions: () => screen.getAllByRole('option'),
		};
	};

	it('should render new as the default value', () => {
		const { trigger } = renderComponent();
		expect(trigger).toHaveTextContent(/new/i);
	});

	it('should render currect statuses', async () => {
		const { trigger, getOptions } = renderComponent();

		const user = userEvent.setup();
		await user.click(trigger);

		const options = getOptions();
		expect(options).toHaveLength(3);

		const labels = options.map(option => option.textContent);
		expect(labels).toEqual(['New', 'Processed', 'Fulfilled']);
	});
});
