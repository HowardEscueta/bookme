import { DaySchedule, Booking, Service } from "./types";

export function generateTimeSlots(
  schedule: DaySchedule | undefined,
  service: Service,
  existingBookings: Booking[],
  date: string
): string[] {
  if (!schedule) return [];

  const slots: string[] = [];
  const [startH, startM] = schedule.start.split(":").map(Number);
  const [endH, endM] = schedule.end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Find booked times for this date
  const bookedTimes = existingBookings
    .filter((b) => b.date === date && b.status !== "cancelled")
    .map((b) => b.time);

  for (let m = startMinutes; m + service.duration <= endMinutes; m += 30) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

    if (!bookedTimes.includes(timeStr)) {
      slots.push(timeStr);
    }
  }

  return slots;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getNextDays(count: number, availability: DaySchedule[]): string[] {
  const days: string[] = [];
  const availableDays = availability.map((a) => a.day);
  const today = new Date();

  for (let i = 1; days.length < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (availableDays.includes(date.getDay())) {
      const dateStr = date.toISOString().split("T")[0];
      days.push(dateStr);
    }
  }

  return days;
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-PH", { weekday: "short" });
}

export function getDayNumber(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDate().toString();
}

export function getMonthName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-PH", { month: "short" });
}
