# 📧 Email Configuration Guide — Sadar Bazar

This guide walks you through setting up **production email** for your Sadar Bazar e-commerce platform. By default, the app ships with a Mailtrap sandbox for development — this guide helps you switch to a real SMTP provider so your customers receive actual emails.

---

## What Emails Are Sent

| Email | When Triggered | Recipient |
|---|---|---|
| **Order Confirmation** | Customer places an order | Customer |
| **Order Shipped** | Admin generates AWB (tracking number) | Customer |
| **New Order Alert** | New order is placed | Admin |

---

## Quick Setup (Environment Variables)

Add these to your **backend `.env` file** (or system environment variables):

```env
# === EMAIL CONFIGURATION ===
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Set to false to disable emails entirely
MAIL_ENABLED=true
```

---

## Provider-Specific Instructions

### Option 1: Gmail (Free, Easy)

1. **Enable 2-Factor Authentication** on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new App Password for "Mail"
4. Use these settings:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx   # 16-char app password
MAIL_FROM=your-gmail@gmail.com
```

> ⚠️ **Note:** Gmail has a sending limit of ~500 emails/day for free accounts. For higher volume, consider a professional provider.

---

### Option 2: Custom Domain (cPanel / Hostinger / Namecheap)

If you have a domain with hosting (e.g., `yourbusiness.pk`):

```env
MAIL_HOST=mail.yourdomain.pk
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.pk
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@yourdomain.pk
```

Contact your hosting provider for the exact SMTP host. Common patterns:
- cPanel: `mail.yourdomain.pk`
- Hostinger: `smtp.hostinger.com`
- Namecheap: `mail.privateemail.com`

---

### Option 3: SendGrid (Professional, High Volume)

1. Sign up at [sendgrid.com](https://sendgrid.com) (free tier: 100 emails/day)
2. Create an API key under **Settings → API Keys**
3. Use these settings:

```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx   # Your SendGrid API key
MAIL_FROM=noreply@yourdomain.pk
```

---

### Option 4: Mailgun (Professional)

```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@mg.yourdomain.pk
MAIL_PASSWORD=your-mailgun-password
MAIL_FROM=noreply@yourdomain.pk
```

---

## Testing Your Setup

1. Set the environment variables
2. Restart the backend server
3. Place a test order from the storefront
4. Check:
   - Customer should receive an order confirmation email
   - Admin should receive a new order alert email
5. Generate an AWB from the admin panel for that order
6. Check:
   - Customer should receive a shipping notification with tracking link

---

## Disabling Emails

To disable email sending entirely (useful for development):

```env
MAIL_ENABLED=false
```

Emails will be silently skipped and logged as info messages.

---

## Customizing Email Templates

Email templates are located at:

```
backend/src/main/resources/templates/email/
├── order-confirmation.html
├── order-shipped.html
└── admin-new-order.html
```

These are **Thymeleaf HTML templates**. You can edit them to:
- Change branding colors and logo
- Modify text and layout
- Add/remove fields

**Template variables available:**
- `${orderId}` — Short order ID (8 chars)
- `${customerName}`, `${customerPhone}`
- `${shippingAddress}`, `${shippingCity}`
- `${total}`, `${subtotal}`, `${shipping}`, `${discount}`
- `${paymentMethod}`, `${orderDate}`
- `${items}` — List with `name`, `qty`, `price`, `total`
- `${trackingNumber}`, `${courierName}`, `${trackingUrl}` (shipped email only)

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Emails not sending | Check `MAIL_ENABLED=true` and verify SMTP credentials |
| `AuthenticationFailedException` | Wrong password. For Gmail, use App Password, not your regular password |
| Emails going to spam | Use a custom domain email. Add SPF/DKIM DNS records |
| Connection timeout | Check `MAIL_HOST` and `MAIL_PORT`. Try port 465 with SSL instead of 587 |
| `MailSendException` | Check backend logs for detailed error. Ensure SMTP host allows connections |
