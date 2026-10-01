import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { hydrated } from '@/store/actions';

export const AVATAR_COLORS = ['vermilion', 'ink', 'forest', 'ocean', 'plum', 'mustard'] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarColor: AvatarColor;
  /** ISO timestamp of the first sign-in. */
  joinedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
}

const initialState: AuthState = { user: null };

/**
 * Mock authentication. There is no server or password: signing in stores a
 * profile locally. The assignment allows mock auth, and it keeps secrets out
 * of the demo. Swapping in a real provider only changes these actions.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: {
      reducer(state, action: PayloadAction<UserProfile>) {
        state.user = action.payload;
      },
      prepare({ name, email }: { name: string; email: string }) {
        return {
          payload: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            bio: '',
            avatarColor: 'vermilion' as AvatarColor,
            joinedAt: new Date().toISOString(),
          },
        };
      },
    },
    updateProfile(state, action: PayloadAction<Partial<Omit<UserProfile, 'joinedAt'>>>) {
      if (state.user) Object.assign(state.user, action.payload);
    },
    signOut(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrated, (state, action) => action.payload.auth ?? state);
  },
});

export const { signIn, updateProfile, signOut } = authSlice.actions;
export const authReducer = authSlice.reducer;

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0]?.[0], parts.at(-1)?.[0]] : [parts[0]?.[0]];
  return letters.join('').toUpperCase() || '?';
}
