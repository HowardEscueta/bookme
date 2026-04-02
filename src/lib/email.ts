import nodemailer from "nodemailer";

function getTransport() {
  const user = process.env.GMAIL_ADDRESS;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendBookingNotification({
  providerEmail,
  providerBusiness,
  clientName,
  clientPhone,
  serviceName,
  date,
  time,
}: {
  providerEmail: string;
  providerBusiness: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
}) {
  const transport = getTransport();
  if (!transport) return; // silently skip if Gmail not configured

  const subject = `New booking from ${clientName} — ${serviceName}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#111;">New Booking</h2>
      <p style="color:#555;">Someone just booked an appointment at <strong>${providerBusiness}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;width:120px;">Client</td><td style="padding:10px 0;font-weight:600;">${clientName}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;">Phone</td><td style="padding:10px 0;">${clientPhone}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;">Service</td><td style="padding:10px 0;">${serviceName}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;border-bottom:1px solid #eee;">Date</td><td style="padding:10px 0;">${date}</td></tr>
        <tr><td style="padding:10px 0;color:#888;font-size:13px;">Time</td><td style="padding:10px 0;">${time}</td></tr>
      </table>
      <p style="margin-top:24px;color:#888;font-size:12px;">Sent by BookMe</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: process.env.GMAIL_ADDRESS,
      to: providerEmail,
      subject,
      html,
    });
  } catch {
    // Don't fail the booking if email fails
  }
}
