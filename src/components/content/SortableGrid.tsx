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

import { useT } from '@/i18n/useT';
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
  const { t } = useT();
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const sensors = useSensors(
    // A small distance lets plain clicks on links and buttons still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    // Press and hold on touch screens, so swiping still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: UniqueIdentifier) => byId.get(String(id))?.title ?? t('dnd.card');
  const positionOf = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;

  const total = ids.length;
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t('dnd.pickedUp', { title: titleOf(active.id), position: positionOf(active.id), total }),
    onDragOver: ({ active, over }) =>
      over
        ? t('dnd.movedTo', { title: titleOf(active.id), position: positionOf(over.id), total })
        : t('dnd.notOver', { title: titleOf(active.id) }),
    onDragEnd: ({ active, over }) =>
      over
        ? t('dnd.dropped', { title: titleOf(active.id), position: positionOf(over.id), total })
        : t('dnd.droppedUnchanged', { title: titleOf(active.id) }),
    onDragCancel: ({ active }) => t('dnd.cancelled', { title: titleOf(active.id) }),
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
          draggable: t('dnd.instructions'),
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
            handle={
              <GripButton
                reorderLabel={t('common.reorder', { title: activeItem.title })}
                dragTitle={t('common.dragToReorder')}
              />
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableCard({ item, index }: { item: ContentItem; index: number }) {
  const { t } = useT();
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
              reorderLabel={t('common.reorder', { title: item.title })}
              dragTitle={t('common.dragToReorder')}
              {...attributes}
              {...listeners}
            />
          }
        />
      </div>
    </li>
  );
}

type GripButtonProps = React.ComponentPropsWithRef<'button'> & {
  reorderLabel: string;
  dragTitle: string;
};

function GripButton({ reorderLabel, dragTitle, className, ...props }: GripButtonProps) {
  return (
    <button
      type="button"
      {...props}
      aria-label={reorderLabel}
      title={dragTitle}
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
