"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyField } from "@/components/ui/copy-field";
import type { ActivationLink } from "@/lib/api/types";

interface ActivationLinkDialogProps {
  link: ActivationLink | null;
  onOpenChange: (open: boolean) => void;
}

export function ActivationLinkDialog({ link, onOpenChange }: ActivationLinkDialogProps) {
  return (
    <Dialog open={Boolean(link)} onOpenChange={onOpenChange}>
      <DialogContent>
        {link && (
          <>
            <DialogHeader>
              <DialogTitle>New link for {link.user.name}</DialogTitle>
              <DialogDescription>
                Any previous link for this person no longer works. Send them this one.
              </DialogDescription>
            </DialogHeader>
            <CopyField value={link.activationLink} />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
