import { createAction } from '@reduxjs/toolkit';

import type { PersistedState } from './persistence';

/**
 * Dispatched once, after mount, with whatever was saved in localStorage.
 * Each persisted slice handles it in `extraReducers`. Running it after mount
 * (not during render) keeps the first client render identical to the server's.
 */
export const hydrated = createAction<Partial<PersistedState>>('app/hydrated');
