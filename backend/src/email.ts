import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendCriticalAlert(ticket: { customer: string, issue: string, priority: string }) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Skipping email alert.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Prometheus Admin <onboarding@resend.dev>',
      to: [process.env.ALERT_EMAIL || 'mbuguashane3@gmail.com'], 
      subject: `🚨 CRITICAL TICKET: ${ticket.customer}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ef4444; border-radius: 10px;">
          <h2 style="color: #ef4444;">Critical Support Alert</h2>
          <p><strong>Customer:</strong> ${ticket.customer}</p>
          <p><strong>Issue:</strong> ${ticket.issue}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <hr />
          <p style="font-size: 0.8rem; color: #64748b;">This is an automated alert from your Prometheus Dashboard.</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Alert email sent successfully:', data?.id);
    }
  } catch (err) {
    console.error('Unexpected error sending email:', err);
  }
}
