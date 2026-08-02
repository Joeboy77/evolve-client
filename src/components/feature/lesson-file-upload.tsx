"use client";

import { Paperclip } from "lucide-react";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { curriculumFilesApi } from "@/lib/api/curriculum";
import { cn } from "@/lib/utils";

export function LessonFileUpload({ lessonId }: { lessonId: string }) {
  const queryClient = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const upload = useMutation({
    mutationFn: (file: File) => curriculumFilesApi.attach(lessonId, file),
    onSuccess: (file) => {
      toast.success(`${file.fileName} attached`);
      queryClient.invalidateQueries({ queryKey: ["lesson", lessonId] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : "That file could not be uploaded"),
  });

  function send(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      upload.mutate(file);
    }
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        send(event.dataTransfer.files);
      }}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-4 py-3 transition-colors",
        dragging
          ? "bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent)]"
          : "shadow-[inset_0_0_0_1px_var(--line)]",
      )}
    >
      <div className="flex items-center gap-2.5">
        <Paperclip className="size-4 text-ink-subtle" />
        <p className="text-xs text-ink-muted">
          {upload.isPending ? "Uploading…" : "Drop a slide deck, PDF, or image here"}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          send(event.target.files);
          event.target.value = "";
        }}
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
      >
        Choose file
      </Button>
    </div>
  );
}
