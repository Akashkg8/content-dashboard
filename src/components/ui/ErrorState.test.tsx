import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorState } from './ErrorState';
import { renderWithStore as render } from '../../../tests/utils/renderWithStore';

describe('ErrorState', () => {
  it('is announced as an alert and retries on click', async () => {
    const onRetry = jest.fn();
    render(<ErrorState message="News failed to load" onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('News failed to load');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when there is nothing to retry', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
