import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = process.env.RESEND_FROM_EMAIL ?? "SnapSchool <noreply@snapschool.app>";

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to SnapSchool!",
    html: `<h2>Welcome, ${name}!</h2><p>Your SnapSchool account is ready. Log in to set up your school and start uploading photos.</p>`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  total: string
) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed – ${orderNumber}`,
    html: `<h2>Thank you, ${name}!</h2><p>Your order <strong>${orderNumber}</strong> has been confirmed. Total: <strong>${total}</strong>.</p>`,
  });
}

export async function sendAccessCodeEmail(
  to: string,
  studentName: string,
  username: string,
  accessCode: string,
  schoolName: string
) {
  if (!process.env.RESEND_API_KEY) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${studentName}'s School Photo Access Code`,
    html: `
      <h2>School Photo Access – ${schoolName}</h2>
      <p>Here are the login details to view ${studentName}'s school photos:</p>
      <p><strong>Username:</strong> ${username}<br/>
      <strong>Access Code:</strong> ${accessCode}</p>
    `,
  });
}
