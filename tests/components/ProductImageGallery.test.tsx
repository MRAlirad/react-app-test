import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductImageGallery from '../../src/components/ProductImageGallery';

describe('ProductImageGallery', () => {
	it('should render nothing if given an empty array', () => {
		const { container } = render(<ProductImageGallery imageUrls={[]} />);

		expect(container).toBeEmptyDOMElement();
	});

	it('should render a list of images', () => {
		const imageUrls = ['url1', 'url2', 'url3'];
		render(<ProductImageGallery imageUrls={imageUrls} />);

		const images = screen.getAllByRole('img');

		expect(images).toHaveLength(3);
		imageUrls.forEach((url, index) => {
			expect(images[index]).toHaveAttribute('src', url);
		});
	});
});
