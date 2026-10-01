/**
 * Move `activeId` to the position currently held by `overId`, the way
 * drag-and-drop libraries do. Returns the same array when either id is missing.
 */
export function arrayMoveById<T extends string>(ids: readonly T[], activeId: T, overId: T): T[] {
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1 || from === to) return [...ids];
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}
