export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number; // PHP
}

export interface Provider {
  slug: string;
  name: string;
  business: string;
  bio: string;
  services: Service[];
  availability: DaySchedule[];
}

export interface DaySchedule {
  day: number; // 0 = Sunday, 1 = Monday, etc.
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  date: string; // "2026-04-01"
  time: string; // "10:00"
  clientName: string;
  clientPhone: string;
  status: "pending" | "confirmed" | "cancelled";
}
