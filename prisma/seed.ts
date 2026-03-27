import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create demo provider
  const provider = await prisma.provider.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      email: "demo@bookme.ph",
      passwordHash: hashSync("demo1234", 10),
      name: "Juan Dela Cruz",
      businessName: "Juan's Barbershop",
      slug: "demo",
      bio: "Clean cuts, fresh fades. Walk-ins welcome, but booking guarantees your slot.",
    },
  });

  // Create services
  const services = [
    { name: "Regular Haircut", duration: 30, price: 150, sortOrder: 0 },
    { name: "Haircut + Beard Trim", duration: 45, price: 250, sortOrder: 1 },
    { name: "Hot Towel Shave", duration: 30, price: 200, sortOrder: 2 },
    { name: "Hair Color", duration: 60, price: 500, sortOrder: 3 },
  ];

  // Delete existing services for this provider, then recreate
  await prisma.service.deleteMany({ where: { providerId: provider.id } });
  for (const service of services) {
    await prisma.service.create({
      data: {
        providerId: provider.id,
        ...service,
      },
    });
  }

  // Create availability (Mon-Sat)
  const schedule = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
    { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
  ];

  for (const slot of schedule) {
    await prisma.availability.upsert({
      where: {
        providerId_dayOfWeek: {
          providerId: provider.id,
          dayOfWeek: slot.dayOfWeek,
        },
      },
      update: {
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      create: {
        providerId: provider.id,
        ...slot,
      },
    });
  }

  console.log("Seed complete: demo provider created");
  console.log("  Email: demo@bookme.ph");
  console.log("  Password: demo1234");
  console.log("  Booking page: /demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
