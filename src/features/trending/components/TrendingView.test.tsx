import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { TrendingView } from './TrendingView';
import { server } from '../../../../tests/msw/server';
import { renderWithStore } from '../../../../tests/utils/renderWithStore';

describe('TrendingView (integration)', () => {
  it('ranks the top stories and lists each source', async () => {
    renderWithStore(<TrendingView />);

    expect(await screen.findByText('No. 1')).toBeInTheDocument();
    for (const name of ['Most read', 'Most watched', 'Most shared']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
  });

  it('switches category with the keyboard, following the tabs pattern', async () => {
    renderWithStore(<TrendingView />);
    const all = screen.getByRole('tab', { name: 'All' });
    expect(all).toHaveAttribute('aria-selected', 'true');
    await screen.findByText('No. 1');

    all.focus();
    await userEvent.keyboard('{ArrowRight}');

    const technology = screen.getByRole('tab', { name: 'Technology' });
    expect(technology).toHaveFocus();
    expect(technology).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel');
    expect(await within(panel).findAllByText(/technology 1/)).not.toHaveLength(0);

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Science' })).toHaveFocus();
  });

  it('recovers from an error with retry', async () => {
    server.use(http.get('*/api/trending', () => HttpResponse.json({}, { status: 503 })));
    renderWithStore(<TrendingView />);

    expect(await screen.findByText('Trending could not load')).toBeInTheDocument();
    server.resetHandlers();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('No. 1')).toBeInTheDocument();
  });
});
