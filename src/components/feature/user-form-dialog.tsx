"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CopyField } from "@/components/ui/copy-field";
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
import type { ActivationLink, Role, UserProfile } from "@/lib/api/types";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-users";

const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  role: z.enum(["STUDENT", "MENTOR", "ADMIN"]),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: UserProfile | null;
}

export function UserFormDialog({ open, onOpenChange, editing }: UserFormDialogProps) {
  const [issuedLink, setIssuedLink] = React.useState<ActivationLink | null>(null);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", role: "STUDENT" },
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setIssuedLink(null);
    reset(
      editing
        ? { name: editing.name, email: editing.email, role: editing.role }
        : { name: "", email: "", role: "STUDENT" },
    );
  }, [open, editing, reset]);

  function applyServerErrors(error: unknown) {
    if (error instanceof ApiError && error.fieldErrors.length > 0) {
      for (const violation of error.fieldErrors) {
        setError(violation.field as keyof UserFormValues, { message: violation.message });
      }
      return;
    }
    if (error instanceof ApiError && error.code === "RESOURCE_CONFLICT") {
      setError("email", { message: error.message });
    }
  }

  function onSubmit(values: UserFormValues) {
    if (editing) {
      updateUser.mutate(
        { id: editing.id, payload: values },
        { onSuccess: () => onOpenChange(false), onError: applyServerErrors },
      );
      return;
    }

    createUser.mutate(values, {
      onSuccess: (link) => setIssuedLink(link),
      onError: applyServerErrors,
    });
  }

  const pending = createUser.isPending || updateUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {issuedLink ? (
          <>
            <DialogHeader>
              <DialogTitle>Send {issuedLink.user.name} their link</DialogTitle>
              <DialogDescription>
                Evolve does not email this automatically. Copy the link and send it however you
                normally reach them.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <CopyField value={issuedLink.activationLink} />
              <div className="flex items-start gap-2.5 rounded-md bg-caution-soft px-3.5 py-3">
                <Send className="mt-0.5 size-3.5 shrink-0 text-caution-ink" />
                <p className="text-xs text-caution-ink">
                  This link works once and expires on{" "}
                  {new Date(issuedLink.expiresAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  . You can generate a new one at any time.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit user" : "Add a user"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update their details. Changing the email does not invalidate their password."
                  : "Create the account, then copy the activation link and send it to them."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Field label="Full name" htmlFor="user-name" error={errors.name?.message}>
                <Input
                  id="user-name"
                  autoFocus
                  placeholder="Ama Mensah"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
              </Field>

              <Field label="Email address" htmlFor="user-email" error={errors.email?.message}>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="ama@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </Field>

              <Field label="Role" htmlFor="user-role" error={errors.role?.message}>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="user-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="MENTOR">Mentor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                {editing ? "Save changes" : "Create and get link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
