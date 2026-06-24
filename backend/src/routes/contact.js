const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');

router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields: name, email, subject, message' });
    }

    // 1. Always save the message to MongoDB first
    const contactMessage = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    console.log(`✉️ New contact message saved in database from ${email}`);

    // 2. Check if SMTP configuration is available in .env
    // 2. Check if Resend or SMTP configuration is available in .env
    const { RESEND_API_KEY, EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT, CONTACT_EMAIL } = process.env;
    const targetEmail = CONTACT_EMAIL || 'shubhamyk6369@gmail.com';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4285F4; border-bottom: 1px solid #ddd; padding-bottom: 10px;">New CampusPath Contact Message</h2>
        <p>You have received a new support/feedback message via CampusPath AI.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold; width: 120px;">Name:</td>
            <td style="padding: 10px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold;">Subject:</td>
            <td style="padding: 10px;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f2f5f9; border-radius: 8px; border-left: 4px solid #4285F4; white-space: pre-wrap;">
          <strong>Message:</strong><br/>
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <div style="margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
          Stored Database ID: <code>${contactMessage._id}</code><br/>
          Timestamp: ${contactMessage.createdAt}
        </div>
      </div>
    `;

    if (RESEND_API_KEY) {
      // Send via Resend HTTP API (Port 443 - HTTPS, not blocked by Render)
      const axios = require('axios');
      axios.post('https://api.resend.com/emails', {
        from: 'CampusPath Support <onboarding@resend.dev>',
        to: targetEmail,
        reply_to: email,
        subject: `CampusPath Contact: ${subject}`,
        html: emailHtml
      }, {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('📬 Support email successfully dispatched via Resend API! ID:', response.data.id);
      })
      .catch(error => {
        console.error('❌ Failed to send contact email via Resend API:', error.response?.data || error.message);
      });

      return res.status(200).json({
        success: true,
        message: 'Message sent and stored successfully via Resend API.',
        localStored: false,
      });
    }

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn('⚠️ SMTP credentials (EMAIL_USER, EMAIL_PASS) are missing in .env. Skipping email sending. Message is saved locally in database.');
      return res.status(200).json({
        success: true,
        message: 'Message received and stored in database successfully.',
        localStored: true,
      });
    }

    // 3. Configure Transporter (Local fallback)
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(EMAIL_PORT) || 587,
      secure: parseInt(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // 4. Set up email options
    const mailOptions = {
      from: `"${name} (CampusPath Support)" <${EMAIL_USER}>`,
      to: targetEmail,
      replyTo: email,
      subject: `CampusPath Contact: ${subject}`,
      text: `You have received a new message from the CampusPath AI contact form:\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message:\n${message}\n\n` +
            `----------------------------------------\n` +
            `Stored DB ID: ${contactMessage._id}\n` +
            `Timestamp: ${contactMessage.createdAt}`,
      html: emailHtml,
    };

    // 5. Send the email asynchronously (Local fallback)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Failed to send contact email:', error.message);
      } else {
        console.log('📬 Support email successfully dispatched! Message ID:', info.messageId);
      }
    });

    // Return success since the message was stored safely in database
    return res.status(200).json({
      success: true,
      message: 'Message sent and stored successfully.',
      localStored: false,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
