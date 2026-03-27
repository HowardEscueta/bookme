import { Provider, Booking } from "./types";

export const demoProvider: Provider = {
  slug: "demo",
  name: "Juan Dela Cruz",
  business: "Juan's Barbershop",
  bio: "Clean cuts, fresh fades. Walk-ins welcome, but booking guarantees your slot.",
  services: [
    { id: "s1", name: "Regular Haircut", duration: 30, price: 150 },
    { id: "s2", name: "Haircut + Beard Trim", duration: 45, price: 250 },
    { id: "s3", name: "Hot Towel Shave", duration: 30, price: 200 },
    { id: "s4", name: "Hair Color", duration: 60, price: 500 },
  ],
  availability: [
    { day: 1, start: "09:00", end: "18:00" },
    { day: 2, start: "09:00", end: "18:00" },
    { day: 3, start: "09:00", end: "18:00" },
    { day: 4, start: "09:00", end: "18:00" },
    { day: 5, start: "09:00", end: "18:00" },
    { day: 6, start: "09:00", end: "17:00" },
  ],
};

export const demoBookings: Booking[] = [
  {
    id: "b1",
    providerId: "demo",
    serviceId: "s1",
    date: "2026-03-28",
    time: "10:00",
    clientName: "Mark Santos",
    clientPhone: "09171234567",
    status: "confirmed",
  },
  {
    id: "b2",
    providerId: "demo",
    serviceId: "s2",
    date: "2026-03-28",
    time: "14:00",
    clientName: "Paolo Reyes",
    clientPhone: "09181234567",
    status: "confirmed",
  },
];
