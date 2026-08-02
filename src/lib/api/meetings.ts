import { apiClient } from "@/lib/api/client";

export type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";

export interface MeetingSlot {
  id: string;
  mentorId: string;
  mentorName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  meetingLink: string | null;
  recurring: boolean;
  blocked: boolean;
  booked: boolean;
  bookingId: string | null;
  bookedByName: string | null;
}

export interface MeetingBooking {
  id: string;
  slotId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  topic: string | null;
  mentorNotes: string | null;
  meetingLink: string | null;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  bookedAt: string;
  cancelledAt: string | null;
  past: boolean;
}

export interface SlotPayload {
  startTime: string;
  endTime: string;
  meetingLink?: string | null;
  recurrence?: { frequency: "DAILY" | "WEEKLY"; until: string } | null;
}

export const meetingsApi = {
  slots: () => apiClient.get<MeetingSlot[]>("/meetings/slots"),
  mine: () => apiClient.get<MeetingBooking[]>("/meetings"),
  book: (slotId: string, topic: string) =>
    apiClient.post<MeetingBooking>(`/meetings/slots/${slotId}/book`, { topic }),
  cancel: (bookingId: string) => apiClient.post<MeetingBooking>(`/meetings/${bookingId}/cancel`, {}),
  reschedule: (bookingId: string, newSlotId: string) =>
    apiClient.post<MeetingBooking>(`/meetings/${bookingId}/reschedule`, { newSlotId }),
};

export const meetingsAdminApi = {
  openAvailability: (payload: SlotPayload) =>
    apiClient.post<{ created: number; skipped: number }>("/admin/meetings/slots", payload),
  slots: () => apiClient.get<MeetingSlot[]>("/admin/meetings/slots"),
  releaseSlot: (slotId: string) => apiClient.delete<void>(`/admin/meetings/slots/${slotId}`),
  upcoming: () => apiClient.get<MeetingBooking[]>("/admin/meetings/upcoming"),
  past: () => apiClient.get<MeetingBooking[]>("/admin/meetings/past"),
  addNotes: (bookingId: string, notes: string) =>
    apiClient.post<MeetingBooking>(`/admin/meetings/${bookingId}/notes`, { notes }),
};
