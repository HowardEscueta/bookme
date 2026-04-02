"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTime, formatDate } from "@/lib/time-utils";

interface ProviderData {
  id: string;
  name: string;
  businessName: string;
  slug: string;
  bio: string;
  email: string;
}

interface ServiceData {
  id: string;
  name: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface AvailabilityData {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookingData {
  id: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  status: string;
  service: { name: string; duration: number; price: number };
}

type Tab = "bookings" | "services" | "hours" | "profile";

export default function Dashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [availability, setAvailability] = useState<AvailabilityData[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [loading, setLoading] = useState(true);

  // Service state
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: "", duration: "30", price: "" });
  const [editingService, setEditingService] = useState<ServiceData | null>(null);

  // Profile state
  const [profileForm, setProfileForm] = useState({ businessName: "", bio: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const loadData = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    const me = await meRes.json();
    setProvider(me);
    setProfileForm({ businessName: me.businessName, bio: me.bio || "" });

    const [bookingsRes, servicesRes, availRes] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/services"),
      fetch("/api/availability"),
    ]);

    setBookings(await bookingsRes.json());
    setServices(await servicesRes.json());
    setAvailability(await availRes.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function updateBookingStatus(id: string, status: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b)));
    }
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newService.name,
        duration: Number(newService.duration),
        price: Number(newService.price),
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setServices((prev) => [...prev, created]);
      setNewService({ name: "", duration: "30", price: "" });
      setShowAddService(false);
    }
  }

  async function saveEditService(e: React.FormEvent) {
    e.preventDefault();
    if (!editingService) return;
    const res = await fetch(`/api/services/${editingService.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingService.name,
        duration: editingService.duration,
        price: editingService.price,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingService(null);
    }
  }

  async function deleteService(id: string) {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
    if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function saveAvailability(dayOfWeek: number, startTime: string, endTime: string, enabled: boolean) {
    const current = availability.filter((a) => a.dayOfWeek !== dayOfWeek);
    const schedule = enabled
      ? [...current.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime })), { dayOfWeek, startTime, endTime }]
      : current.map((a) => ({ dayOfWeek: a.dayOfWeek, startTime: a.startTime, endTime: a.endTime }));

    const res = await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    if (res.ok) setAvailability(await res.json());
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setProvider((prev) => prev ? { ...prev, ...updated } : prev);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
    setProfileSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!provider) return null;

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const revenue = confirmedBookings.reduce((sum, b) => sum + b.service.price, 0);

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.date + "T" + b.time) >= now && b.status !== "cancelled");
  const past = bookings.filter((b) => new Date(b.date + "T" + b.time) < now || b.status === "cancelled");

  return (
    <div className="min-h-screen bg-bg-warm">
      {/* Top nav */}
      <nav className="bg-bg shadow-sm shadow-black/[0.03]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-secondary tracking-tight">BookMe</Link>
          <div className="flex items-center gap-5">
            <Link href={`/${provider.slug}`} className="text-sm text-primary font-medium hover:underline">
              View booking page
            </Link>
            <button onClick={handleLogout} className="text-sm text-muted hover:text-secondary">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary tracking-tight">{provider.businessName}</h1>
          <p className="text-muted mt-1">
            Your link: <span className="text-primary font-medium">/{provider.slug}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-3xl font-bold text-secondary">{bookings.length}</p>
            <p className="text-sm text-muted mt-1">Total bookings</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-primary">{upcoming.length}</p>
            <p className="text-sm text-muted mt-1">Upcoming</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-secondary">{services.length}</p>
            <p className="text-sm text-muted mt-1">Services</p>
          </div>
          <div className="card p-5">
            <p className="text-3xl font-bold text-secondary">P{revenue.toLocaleString()}</p>
            <p className="text-sm text-muted mt-1">Revenue</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {(["bookings", "services", "hours", "profile"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full capitalize ${
                activeTab === tab ? "bg-secondary text-white" : "text-muted hover:text-secondary hover:bg-bg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <div className="flex flex-col gap-6">
            {upcoming.length > 0 && (
              <div>
                <p className="text-sm font-medium text-secondary mb-3">Upcoming ({upcoming.length})</p>
                <div className="flex flex-col gap-3">
                  {upcoming.map((booking) => (
                    <div key={booking.id} className="card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-secondary">{booking.clientName}</p>
                          <p className="text-sm text-muted mt-1">
                            {booking.service.name} · {formatDate(booking.date)} at {formatTime(booking.time)}
                          </p>
                          <p className="text-sm text-muted">{booking.clientPhone}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {booking.status === "pending" && (
                            <>
                              <button onClick={() => updateBookingStatus(booking.id, "confirmed")} className="text-xs font-medium bg-success-light text-success px-3.5 py-2 rounded-full hover:bg-green-100">Confirm</button>
                              <button onClick={() => updateBookingStatus(booking.id, "cancelled")} className="text-xs font-medium bg-error-light text-error px-3.5 py-2 rounded-full hover:bg-red-100">Cancel</button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <span className="text-xs font-medium bg-success-light text-success px-3.5 py-2 rounded-full">Confirmed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted mb-3">Past ({past.length})</p>
                <div className="flex flex-col gap-3">
                  {past.map((booking) => (
                    <div key={booking.id} className="card p-5 opacity-60">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-secondary">{booking.clientName}</p>
                          <p className="text-sm text-muted mt-1">
                            {booking.service.name} · {formatDate(booking.date)} at {formatTime(booking.time)}
                          </p>
                          <p className="text-sm text-muted">{booking.clientPhone}</p>
                        </div>
                        <span className={`text-xs font-medium px-3.5 py-2 rounded-full flex-shrink-0 ${
                          booking.status === "cancelled" ? "bg-error-light text-error" : "bg-bg-soft text-muted"
                        }`}>
                          {booking.status === "cancelled" ? "Cancelled" : "Done"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <div className="card text-center py-20">
                <p className="text-lg font-medium text-secondary mb-1">No bookings yet</p>
                <p className="text-sm text-muted">Share your booking link to start getting appointments.</p>
              </div>
            )}
          </div>
        )}

        {/* Services tab */}
        {activeTab === "services" && (
          <div>
            <div className="flex flex-col gap-3">
              {services.map((service) =>
                editingService?.id === service.id ? (
                  <form key={service.id} onSubmit={saveEditService} className="card p-5 flex flex-col gap-4">
                    <input
                      type="text"
                      required
                      value={editingService.name}
                      onChange={(e) => setEditingService((s) => s ? { ...s, name: e.target.value } : s)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                    <div className="flex gap-3">
                      <input
                        type="number"
                        required
                        value={editingService.duration}
                        onChange={(e) => setEditingService((s) => s ? { ...s, duration: Number(e.target.value) } : s)}
                        placeholder="Duration (min)"
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                      <input
                        type="number"
                        required
                        value={editingService.price}
                        onChange={(e) => setEditingService((s) => s ? { ...s, price: Number(e.target.value) } : s)}
                        placeholder="Price (PHP)"
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-hover shadow-sm">Save</button>
                      <button type="button" onClick={() => setEditingService(null)} className="text-sm text-muted hover:text-secondary px-4">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div key={service.id} className="card p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary">{service.name}</p>
                      <p className="text-sm text-muted mt-0.5">{service.duration} min · P{service.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditingService(service)} className="text-sm text-muted hover:text-primary">Edit</button>
                      <button onClick={() => deleteService(service.id)} className="text-sm text-muted hover:text-error">Remove</button>
                    </div>
                  </div>
                )
              )}
            </div>

            {showAddService ? (
              <form onSubmit={addService} className="mt-4 card p-5 flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Service name"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    required
                    value={newService.duration}
                    onChange={(e) => setNewService((p) => ({ ...p, duration: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Price (PHP)"
                    required
                    value={newService.price}
                    onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-hover shadow-sm">Add Service</button>
                  <button type="button" onClick={() => setShowAddService(false)} className="text-sm text-muted hover:text-secondary px-4">Cancel</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddService(true)}
                className="mt-4 w-full py-4 border-2 border-dashed border-border/60 rounded-2xl text-sm font-medium text-muted hover:border-primary/40 hover:text-primary"
              >
                + Add service
              </button>
            )}
          </div>
        )}

        {/* Hours tab */}
        {activeTab === "hours" && (
          <div className="flex flex-col gap-2">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
              const schedule = availability.find((a) => a.dayOfWeek === index);
              const isOpen = !!schedule;
              return (
                <div key={day} className="card p-5 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-6 rounded-full relative cursor-pointer ${isOpen ? "bg-primary" : "bg-border"}`}
                      onClick={() => saveAvailability(index, schedule?.startTime || "09:00", schedule?.endTime || "18:00", !isOpen)}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm ${isOpen ? "right-1" : "left-1"}`} />
                    </div>
                    <span className={`font-medium w-28 ${isOpen ? "text-secondary" : "text-muted"}`}>{day}</span>
                  </label>
                  {isOpen ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => saveAvailability(index, e.target.value, schedule.endTime, true)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-secondary"
                      />
                      <span className="text-muted text-sm">to</span>
                      <input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => saveAvailability(index, schedule.startTime, e.target.value, true)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-bg text-sm text-secondary"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Closed</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === "profile" && (
          <div className="max-w-lg">
            <form onSubmit={saveProfile} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Business name</label>
                <input
                  type="text"
                  required
                  value={profileForm.businessName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, businessName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell clients a little about your business..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-secondary placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover disabled:opacity-50 shadow-sm"
                >
                  {profileSaving ? "Saving..." : "Save changes"}
                </button>
                {profileSaved && <span className="text-sm text-success font-medium">Saved</span>}
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-border/50">
              <p className="text-sm font-medium text-secondary mb-1">Your booking link</p>
              <p className="text-muted text-sm">bookme.ph/<span className="text-primary font-medium">{provider.slug}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
