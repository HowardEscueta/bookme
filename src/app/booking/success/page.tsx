"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatTime, formatDate } from "@/lib/time-utils";

interface BookingData {
  id: string;
  status: string;
  paymentStatus: string;
  clientName: string;
  date: string;
  time: string;
  service: { name: string; duration: number; price: number };
  provider: { businessName: string; slug: string };
}

export default function BookingSuccessPage() {
  const params = useSearchParams();
  const bookingId = params.get("id");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setBooking)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary mb-2">Booking not found</p>
          <p className="text-muted">This booking doesn&apos;t exist or was cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm flex flex-col">
      <nav className="px-6 py-5">
        <Link href="/" className="text-xl font-bold text-secondary tracking-tight">
          BookMe
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-secondary mb-2 tracking-tight">
            Payment received!
          </h1>
          <p className="text-muted mb-1">
            Your appointment with {booking.provider.businessName} is confirmed.
          </p>
          <p className="text-xs text-muted/60 mb-8">
            Ref: {booking.id.slice(0, 8).toUpperCase()}
          </p>

          <div className="card p-6 text-left">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider">Service</p>
                <p className="font-medium text-secondary mt-0.5">{booking.service.name}</p>
              </div>
              <div className="h-px bg-border/50" />
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wider">When</p>
                <p className="font-medium text-secondary mt-0.5">{formatDate(booking.date)}</p>
                <p className="text-sm text-muted">
                  {formatTime(booking.time)} &middot; {booking.service.duration} min
                </p>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted uppercase tracking-wider">Total paid</p>
                <p className="font-bold text-secondary text-lg">P{booking.service.price}</p>
              </div>
            </div>
          </div>

          <Link
            href={`/${booking.provider.slug}`}
            className="mt-8 inline-block text-primary text-sm font-medium hover:underline"
          >
            Book another appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
