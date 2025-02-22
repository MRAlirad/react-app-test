import { it, expect, describe } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TagList from '../../src/components/TagList';

describe('Taglist', () => {
	it('should render tags', async () => {
		render(<TagList />);

		// await waitFor(() => {
		// 	const listItems = screen.getAllByRole('listitem');
		// 	expect(listItems.length).toBeGreaterThan(0);
		// });

		const listItems = await screen.findAllByRole('listitem');
		expect(listItems.length).toBeGreaterThan(0);
	});
});
