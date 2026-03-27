"use client";

import { useState, useEffect } from "react";
import {
  formatTime,
  formatDate,
  getNextDays,
  getDayName,
  getDayNumber,
  getMonthName,
} from "@/lib/time-utils";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface DaySchedule {
  day: number;
  start: string;
  end: string;
}

interface ProviderData {
  slug: string;
  name: string;
  businessName: string;
  bio: string;
  services: Service[];
  availability: DaySchedule[];
}

type Step = "service" | "datetime" | "details" | "confirmed";

export default function BookingFlow({ slug }: { slug: string }) {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    fetch(`/api/providers/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Provider not found");
        return res.json();
      })
      .then(setProvider)
      .catch(() => setError("Provider not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    setSlotsLoading(true);
    fetch(
      `/api/providers/${slug}/slots?date=${selectedDate}&service=${selectedService.id}`
    )
      .then((res) => res.json())
      .then((data) => setTimeSlots(data.slots || []))
      .finally(() => setSlotsLoading(false));
  }, [slug, selectedService, selectedDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/providers/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        clientName,
        clientPhone,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    setBookingId(data.id);
    setStep("confirmed");
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary mb-2">Not found</p>
          <p className="text-muted">This booking page doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const availableDates = getNextDays(14, provider.availability);

  return (
    <div className="min-h-screen bg-bg-warm">
      {/* Provider header */}
      <div className="bg-bg">
        <div className="max-w-lg mx-auto px-6 pt-10 pb-8">
          <div className="w-14 h-14 bg-primary-light text-primary rounded-2xl flex items-center justify-center text-xl font-bold mb-5">
            {provider.name[0]}
          </div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">
            {provider.businessName}
          </h1>
          {provider.bio && (
            <p className="text-muted mt-2 leading-relaxed">{provider.bio}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {step !== "confirmed" && (
        <div className="bg-bg border-t border-border/50">
          <div className="max-w-lg mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              {["Service", "Date & Time", "Details"].map((label, i) => {
                const steps: Step[] = ["service", "datetime", "details"];
                const isActive = step === steps[i];
                const isPast = steps.indexOf(step) > i;
                return (
                  <div key={label} className="flex items-center gap-3">
                    {i > 0 && (
                      <div
                        className={`w-8 h-px ${
                          isPast ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`text-sm ${
                        isActive
                          ? "text-primary font-medium"
                          : isPast
                            ? "text-primary/60"
                            : "text-muted/60"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-6 py-8">
        {error && step !== "confirmed" && (
          <div className="bg-error-light text-error text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Pick a service */}
        {step === "service" && (
          <div>
            <h2 className="text-lg font-semibold text-secondary mb-1">
              Select a service
            </h2>
            <p className="text-sm text-muted mb-5">
              Choose what you&apos;d like to book.
            </p>
            <div className="flex flex-col gap-3">
              {provider.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setTimeSlots([]);
                    setStep("datetime");
                  }}
                  className="card p-5 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary group-hover:text-primary">
                        {service.name}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        {service.duration} min
                      </p>
                    </div>
                    <p className="font-semibold text-secondary text-lg">
                      P{service.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Pick date and time */}
        {step === "datetime" && selectedService && (
          <div>
            <button
              onClick={() => setStep("service")}
              className="text-sm text-primary mb-5 hover:underline"
            >
              &larr; Change service
            </button>

            <div className="bg-primary-light/50 rounded-xl p-4 mb-8">
              <p className="font-medium text-secondary">
                {selectedService.name}
              </p>
              <p className="text-sm text-primary/70">
                {selectedService.duration} min &middot; P{selectedService.price}
              </p>
            </div>

            <h2 className="text-lg font-semibold text-secondary mb-1">
              Pick a date
            </h2>
            <p className="text-sm text-muted mb-4">
              Showing the next 2 weeks.
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={`flex-shrink-0 w-[4.25rem] py-3 rounded-2xl text-center ${
                    selectedDate === date
                      ? "bg-primary text-white shadow-sm"
                      : "bg-bg text-secondary hover:bg-bg-soft shadow-sm shadow-black/[0.03]"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wide opacity-70">
                    {getDayName(date)}
                  </p>
                  <p className="text-xl font-bold mt-0.5">{getDayNumber(date)}</p>
                  <p className="text-[10px] opacity-70">{getMonthName(date)}</p>
                </button>
              ))}
            </div>

            {selectedDate && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-secondary mb-1">
                  Pick a time
                </h2>
                <p className="text-sm text-muted mb-4">
                  Available slots for {getDayName(selectedDate)},{" "}
                  {getMonthName(selectedDate)} {getDayNumber(selectedDate)}.
                </p>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-muted text-sm py-4">
                    <div className="w-4 h-4 border-2 border-muted/20 border-t-muted rounded-full animate-spin" />
                    Loading available times...
                  </div>
                ) : timeSlots.length === 0 ? (
                  <p className="text-muted text-sm py-4">
                    No available slots for this date. Try another day.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setStep("details");
                        }}
                        className="py-3 rounded-xl text-sm font-medium bg-bg shadow-sm shadow-black/[0.03] hover:bg-primary hover:text-white"
                      >
                        {formatTime(time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Client details */}
        {step === "details" &&
          selectedService &&
          selectedDate &&
          selectedTime && (
            <div>
              <button
                onClick={() => setStep("datetime")}
                className="text-sm text-primary mb-5 hover:underline"
              >
                &larr; Change time
              </button>

              <div className="bg-primary-light/50 rounded-xl p-4 mb-8">
                <p className="font-medium text-secondary">
                  {selectedService.name}
                </p>
                <p className="text-sm text-primary/70">
                  {formatDate(selectedDate)} at {formatTime(selectedTime)}
                </p>
                <p className="text-sm text-primary/70">
                  {selectedService.duration} min &middot; P
                  {selectedService.price}
                </p>
              </div>

              <h2 className="text-lg font-semibold text-secondary mb-1">
                Almost done
              </h2>
              <p className="text-sm text-muted mb-5">
                Enter your details to confirm the booking.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="clientName"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Your name
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="clientPhone"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Phone number
                  </label>
                  <input
                    id="clientPhone"
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="09XX XXX XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-primary-hover disabled:opacity-50 shadow-sm mt-1"
                >
                  {submitting ? "Confirming..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          )}

        {/* Step 4: Confirmation */}
        {step === "confirmed" &&
          selectedService &&
          selectedDate &&
          selectedTime && (
            <div className="text-center pt-8 pb-12">
              <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-2 tracking-tight">
                You&apos;re all set!
              </h2>
              <p className="text-muted mb-1">
                Your appointment with {provider.businessName} is booked.
              </p>
              <p className="text-xs text-muted/60 mb-8">
                Ref: {bookingId.slice(0, 8).toUpperCase()}
              </p>

              <div className="card p-6 text-left max-w-sm mx-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wider">
                      Service
                    </p>
                    <p className="font-medium text-secondary mt-0.5">
                      {selectedService.name}
                    </p>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div>
                    <p className="text-[11px] text-muted uppercase tracking-wider">
                      When
                    </p>
                    <p className="font-medium text-secondary mt-0.5">
                      {formatDate(selectedDate)}
                    </p>
                    <p className="text-sm text-muted">
                      {formatTime(selectedTime)} &middot;{" "}
                      {selectedService.duration} min
                    </p>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted uppercase tracking-wider">
                      Total
                    </p>
                    <p className="font-bold text-secondary text-lg">
                      P{selectedService.price}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep("service");
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setClientName("");
                  setClientPhone("");
                  setBookingId("");
                  setError("");
                }}
                className="mt-8 text-primary text-sm font-medium hover:underline"
              >
                Book another appointment
              </button>
            </div>
          )}
      </div>

      {/* Footer */}
      <footer className="mt-auto px-6 py-6 text-center text-xs text-muted/50">
        Powered by BookMe
      </footer>
    </div>
  );
}
