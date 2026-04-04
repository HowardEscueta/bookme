export type CategoryPreset = {
  id: string;
  label: string;
  color: string;
  services: { name: string; duration: number; price: number }[];
  // days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
  hours: { day: number; start: string; end: string }[];
};

const weekdays = [1, 2, 3, 4, 5];
const monSat = [1, 2, 3, 4, 5, 6];
const everyday = [0, 1, 2, 3, 4, 5, 6];

function hrs(days: number[], start: string, end: string) {
  return days.map((day) => ({ day, start, end }));
}

export const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  barbershop: {
    id: "barbershop",
    label: "Barbershop",
    color: "bg-blue-100 text-blue-700",
    services: [
      { name: "Haircut", duration: 30, price: 150 },
      { name: "Beard Trim", duration: 20, price: 100 },
      { name: "Hair Color", duration: 90, price: 500 },
    ],
    hours: hrs(monSat, "08:00", "19:00"),
  },
  photography: {
    id: "photography",
    label: "Photography Studio",
    color: "bg-purple-100 text-purple-700",
    services: [
      { name: "Portrait Session", duration: 60, price: 2000 },
      { name: "Event Coverage", duration: 240, price: 5000 },
      { name: "Headshots", duration: 45, price: 1500 },
    ],
    hours: hrs(everyday, "09:00", "18:00"),
  },
  dental: {
    id: "dental",
    label: "Dental Clinic",
    color: "bg-cyan-100 text-cyan-700",
    services: [
      { name: "Cleaning", duration: 30, price: 500 },
      { name: "Tooth Extraction", duration: 30, price: 800 },
      { name: "Whitening", duration: 60, price: 3000 },
    ],
    hours: hrs(monSat, "08:00", "17:00"),
  },
  tutorial: {
    id: "tutorial",
    label: "Tutorial Center",
    color: "bg-yellow-100 text-yellow-700",
    services: [
      { name: "Math Tutoring", duration: 60, price: 300 },
      { name: "English Tutoring", duration: 60, price: 300 },
      { name: "Science Tutoring", duration: 60, price: 300 },
    ],
    hours: hrs(monSat, "14:00", "20:00"),
  },
  nailsalon: {
    id: "nailsalon",
    label: "Nail Salon",
    color: "bg-pink-100 text-pink-700",
    services: [
      { name: "Manicure", duration: 45, price: 150 },
      { name: "Pedicure", duration: 45, price: 200 },
      { name: "Gel Nails", duration: 90, price: 400 },
    ],
    hours: hrs(everyday, "09:00", "19:00"),
  },
  massage: {
    id: "massage",
    label: "Massage Spa",
    color: "bg-green-100 text-green-700",
    services: [
      { name: "Swedish Massage (1hr)", duration: 60, price: 500 },
      { name: "Deep Tissue (1hr)", duration: 60, price: 700 },
      { name: "Foot Spa", duration: 30, price: 300 },
    ],
    hours: hrs(everyday, "09:00", "21:00"),
  },
  catering: {
    id: "catering",
    label: "Catering Service",
    color: "bg-orange-100 text-orange-700",
    services: [
      { name: "Standard Package (50 pax)", duration: 240, price: 5000 },
      { name: "Premium Package (100 pax)", duration: 360, price: 10000 },
    ],
    hours: hrs(weekdays, "08:00", "17:00"),
  },
  other: {
    id: "other",
    label: "Other",
    color: "bg-gray-100 text-gray-600",
    services: [],
    hours: [],
  },
};

export const CATEGORY_LIST = Object.values(CATEGORY_PRESETS);
