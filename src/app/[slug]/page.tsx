import BookingFlow from "@/components/booking-flow";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookingFlow slug={slug} />;
}
