import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, role, storeName, storeId } = await req.json();

    if (!email || !storeName) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT } = process.env;

    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP credentials not configured in .env. Logging email details instead.");
      console.log(`[LOCAL DEV MOCK] To: ${email}, Role: ${role}, Store: ${storeName}`);
      return NextResponse.json({ success: true, message: 'Simulated email sent successfully (SMTP not configured)' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || 'smtp.gmail.com',
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const storeUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    const inviteLink = `${storeUrl}/dashboard/${storeId}`;

    const mailOptions = {
      from: `"Shop Admin" <${SMTP_USER}>`,
      to: email,
      subject: `You have been invited to manage ${storeName}`,
      html: `
        <div style="background-color: #f6f9fc; padding: 40px 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin: 0 auto;">
            <tr>
              <td style="background: linear-gradient(135deg, #4285F4 0%, #3367D6 100%); padding: 40px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 0.2); width: 60px; height: 60px; border-radius: 12px; display: inline-block; margin-bottom: 20px; text-align: center; line-height: 60px;">
                  <span style="color: #ffffff; font-size: 32px; font-weight: bold;">${storeName.charAt(0).toUpperCase()}</span>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">You're Invited!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px; color: #444444; line-height: 1.6;">
                <p style="margin-top: 0; font-size: 16px;">Hello there,</p>
                <p style="font-size: 16px;">You have been officially invited to join the management team for <strong style="color: #111;">${storeName}</strong> as a <strong style="background-color: #e8f0fe; color: #4285F4; padding: 2px 8px; border-radius: 4px; font-size: 14px;">${role.toUpperCase()}</strong>.</p>
                <p style="font-size: 16px;">By accepting this invitation, you will gain access to the admin dashboard where you can manage products, orders, and shop settings.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${inviteLink}" style="background-color: #4285F4; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);">Accept Invitation</a>
                </div>
                
                <p style="font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #4285F4; word-break: break-all;">${inviteLink}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 40px 40px 40px; text-align: center;">
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 0 0 20px 0;">
                <p style="font-size: 12px; color: #999; margin: 0;">&copy; ${new Date().getFullYear()} CreateVendor. All rights reserved.</p>
                <p style="font-size: 11px; color: #aaa; margin: 8px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
             <p style="font-size: 12px; color: #999;">Powered by <a href="https://createvendor.shop" style="color: #4285F4; text-decoration: none; font-weight: bold;">CreateVendor</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send invite email', details: error.message }, { status: 500 });
  }
}
