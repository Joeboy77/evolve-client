"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api/client";
import type { Cohort } from "@/lib/api/cohorts";
import { useSaveCohort } from "@/lib/hooks/use-cohorts";

const cohortSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(150, "Name is too long"),
    description: z.string().max(2000, "Description is too long").optional(),
    trackType: z.enum(["WEB", "MOBILE", "DESKTOP", "ML_AI"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "End date must fall on or after the start date",
    path: ["endDate"],
  });

type CohortFormValues = z.infer<typeof cohortSchema>;

interface CohortFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Cohort | null;
}

export function CohortFormDialog({ open, onOpenChange, editing }: CohortFormDialogProps) {
  const saveCohort = useSaveCohort();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CohortFormValues>({
    resolver: zodResolver(cohortSchema),
    defaultValues: {
      name: "",
      description: "",
      trackType: "WEB",
      startDate: "",
      endDate: "",
    },
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }
    reset(
      editing
        ? {
            name: editing.name,
            description: editing.description ?? "",
            trackType: editing.trackType,
            startDate: editing.startDate,
            endDate: editing.endDate,
          }
        : { name: "", description: "", trackType: "WEB", startDate: "", endDate: "" },
    );
  }, [open, editing, reset]);

  function onSubmit(values: CohortFormValues) {
    saveCohort.mutate(
      { id: editing?.id, payload: values },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => {
          if (error instanceof ApiError && error.code === "RESOURCE_CONFLICT") {
            setError("name", { message: error.message });
          }
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit cohort" : "Create a cohort"}</DialogTitle>
            <DialogDescription>
              A cohort is one track running over one period. Students join exactly one at a time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field label="Cohort name" htmlFor="cohort-name" error={errors.name?.message}>
              <Input
                id="cohort-name"
                autoFocus
                placeholder="Web Development — Cohort 1"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="cohort-description"
              error={errors.description?.message}
              hint="Optional. Shown to students on their cohort page."
            >
              <textarea
                id="cohort-description"
                rows={3}
                placeholder="What this cohort covers and who it is for."
                className="w-full resize-none rounded-md bg-surface px-3 py-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow outline-none placeholder:text-ink-subtle focus-visible:shadow-[inset_0_0_0_1px_var(--accent),0_0_0_3px_var(--focus-ring)]"
                {...register("description")}
              />
            </Field>

            <Field label="Track" htmlFor="cohort-track" error={errors.trackType?.message}>
              <Controller
                control={control}
                name="trackType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="cohort-track">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEB">Web Development</SelectItem>
                      <SelectItem value="MOBILE">Mobile Development</SelectItem>
                      <SelectItem value="DESKTOP">Desktop Applications</SelectItem>
                      <SelectItem value="ML_AI">Machine Learning / AI</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" htmlFor="cohort-start" error={errors.startDate?.message}>
                <Input
                  id="cohort-start"
                  type="date"
                  aria-invalid={Boolean(errors.startDate)}
                  {...register("startDate")}
                />
              </Field>
              <Field label="End date" htmlFor="cohort-end" error={errors.endDate?.message}>
                <Input
                  id="cohort-end"
                  type="date"
                  aria-invalid={Boolean(errors.endDate)}
                  {...register("endDate")}
                />
              </Field>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saveCohort.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saveCohort.isPending}>
              {editing ? "Save changes" : "Create cohort"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
