import { Header } from './Header';
import { render, screen } from '@testing-library/react';

describe('Header', () => {
  test('renders', () => {
    render(<Header data-testid='header' />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
