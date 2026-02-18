import { render, screen } from '@testing-library/react';
import App from './App';

test('renders my Academia app', () => {
  render(<App />);
  const linkElement = screen.getByText(/my Academia/i);  expect(linkElement).toBeInTheDocument();
});