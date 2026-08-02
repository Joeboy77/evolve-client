"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Curriculum, CurriculumModule } from "@/lib/api/curriculum";
import { useReorderModules } from "@/lib/hooks/use-curriculum";
import { cn } from "@/lib/utils";

function SortableModule({ module }: { module: CurriculumModule }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg bg-surface px-4 py-3",
        "shadow-[inset_0_0_0_1px_var(--line)]",
        isDragging && "z-10 shadow-[inset_0_0_0_1px_var(--accent)] shadow-ambient",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-ink-subtle transition-colors hover:text-ink active:cursor-grabbing"
        aria-label={`Reorder ${module.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span className="w-14 shrink-0 text-2xs tabular-nums text-ink-subtle">
        Week {module.weekNumber}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink">{module.title}</span>
        <span className="block text-2xs text-ink-subtle">
          {module.lessonCount} {module.lessonCount === 1 ? "lesson" : "lessons"}
        </span>
      </span>

      {module.locked && (
        <Badge tone="neutral">
          <Lock className="size-3" />
          Locked
        </Badge>
      )}
    </div>
  );
}

export function SortableModules({ curriculum }: { curriculum: Curriculum }) {
  const reorder = useReorderModules(curriculum.cohortId);
  const [modules, setModules] = React.useState(curriculum.modules);

  React.useEffect(() => {
    setModules(curriculum.modules);
  }, [curriculum.modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((module) => module.id === active.id);
    const newIndex = modules.findIndex((module) => module.id === over.id);
    const next = arrayMove(modules, oldIndex, newIndex);

    setModules(next);
    reorder.mutate(next.map((module) => module.id));
  }

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <p className="text-2xs font-medium uppercase tracking-wider text-ink-subtle">
            Module order
          </p>
          <p className="text-2xs text-ink-subtle">
            {reorder.isPending ? "Saving…" : "Drag to reorder"}
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={modules.map((module) => module.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {modules.map((module) => (
                <SortableModule key={module.id} module={module} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
