'use client';

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type { ContentItem } from '@/types/content';

import { ContentCard } from './ContentCard';
import { entranceDelay, GRID_CLASSES } from './ContentGrid';

export interface SortableGridProps {
  items: readonly ContentItem[];
  /** Accessible name of the list, such as "Your feed". */
  label: string;
  onReorder: (activeId: string, overId: string) => void;
}

/**
 * Drag-and-drop grid built on dnd-kit. Mouse, touch and keyboard all work:
 * focus a card's grip, press Space to pick it up, move with arrow keys, and
 * press Space to drop or Escape to cancel. Screen readers hear each step.
 */
export function SortableGrid({ items, label, onReorder }: SortableGridProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const sensors = useSensors(
    // A small distance lets plain clicks on links and buttons still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Press and hold on touch screens, so swiping still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: UniqueIdentifier) => byId.get(String(id))?.title ?? 'card';
  const positionOf = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${titleOf(active.id)}. It is at position ${positionOf(active.id)} of ${ids.length}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} moved to position ${positionOf(over.id)} of ${ids.length}.`
        : `${titleOf(active.id)} is no longer over a drop position.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped ${titleOf(active.id)} at position ${positionOf(over.id)} of ${ids.length}.`
        : `Dropped ${titleOf(active.id)}. Order unchanged.`,
    onDragCancel: ({ active }) => `Cancelled. ${titleOf(active.id)} returned to its place.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (over && active.id !== over.id) onReorder(String(active.id), String(over.id));
  };

  const activeItem = activeId ? byId.get(String(activeId)) : undefined;

  return (
    <DndContext
      id="sortable-grid"
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'To reorder, press Space or Enter to pick up this card. Use the arrow keys to move it, then press Space or Enter to drop it, or Escape to cancel.',
        },
      }}
      onDragStart={({ active }: DragStartEvent) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ul aria-label={label} className={GRID_CLASSES}>
          {items.map((item, index) => (
            <SortableCard key={item.id} item={item} index={index} />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <ContentCard
            item={activeItem}
            className="shadow-lift rotate-[1.5deg] cursor-grabbing"
            handle={<GripButton title={activeItem.title} />}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableCard({ item, index }: { item: ContentItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  return (
    <li
      ref={setNodeRef}
      data-testid="feed-card"
      data-id={item.id}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-10 opacity-40')}
    >
      <div className="animate-fade-up h-full" style={entranceDelay(index)}>
        <ContentCard
          item={item}
          priority={index < 3}
          handle={
            <GripButton
              ref={setActivatorNodeRef}
              title={item.title}
              {...attributes}
              {...listeners}
            />
          }
        />
      </div>
    </li>
  );
}

type GripButtonProps = React.ComponentPropsWithRef<'button'> & { title: string };

function GripButton({ title, className, ...props }: GripButtonProps) {
  return (
    <button
      type="button"
      {...props}
      aria-label={`Reorder: ${title}`}
      title="Drag to reorder"
      className={cn(
        'text-ink-muted hover:bg-surface-sunken hover:text-ink inline-flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-full',
        'active:cursor-grabbing',
        className,
      )}
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  );
}
