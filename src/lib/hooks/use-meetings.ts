"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { meetingsAdminApi, meetingsApi, type SlotPayload } from "@/lib/api/meetings";

export const meetingsQueryKey = "meetings";

function describeError(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [meetingsQueryKey] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useBookableSlots() {
  return useQuery({ queryKey: [meetingsQueryKey, "slots"], queryFn: meetingsApi.slots });
}

export function useMyMeetings() {
  return useQuery({ queryKey: [meetingsQueryKey, "mine"], queryFn: meetingsApi.mine, retry: false });
}

export function useMentorSlots() {
  return useQuery({ queryKey: [meetingsQueryKey, "mentor-slots"], queryFn: meetingsAdminApi.slots });
}

export function useUpcomingMeetings() {
  return useQuery({ queryKey: [meetingsQueryKey, "upcoming"], queryFn: meetingsAdminApi.upcoming });
}

export function usePastMeetings() {
  return useQuery({ queryKey: [meetingsQueryKey, "past"], queryFn: meetingsAdminApi.past });
}

export function useBookSlot() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: { slotId: string; topic: string }) =>
      meetingsApi.book(input.slotId, input.topic),
    onSuccess: () => {
      toast.success("Meeting booked");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useCancelMeeting() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: meetingsApi.cancel,
    onSuccess: () => {
      toast.success("Meeting cancelled");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useRescheduleMeeting() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: { bookingId: string; newSlotId: string }) =>
      meetingsApi.reschedule(input.bookingId, input.newSlotId),
    onSuccess: () => {
      toast.success("Meeting moved");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useOpenAvailability() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (payload: SlotPayload) => meetingsAdminApi.openAvailability(payload),
    onSuccess: (result) => {
      toast.success(
        result.skipped === 0
          ? `Opened ${result.created} ${result.created === 1 ? "slot" : "slots"}`
          : `Opened ${result.created}, skipped ${result.skipped} that clashed`,
      );
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useReleaseSlot() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: meetingsAdminApi.releaseSlot,
    onSuccess: () => {
      toast.success("Slot removed");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}

export function useSaveMeetingNotes() {
  const invalidate = useInvalidate();

  return useMutation({
    mutationFn: (input: { bookingId: string; notes: string }) =>
      meetingsAdminApi.addNotes(input.bookingId, input.notes),
    onSuccess: () => {
      toast.success("Notes saved");
      invalidate();
    },
    onError: (error) => toast.error(describeError(error)),
  });
}
