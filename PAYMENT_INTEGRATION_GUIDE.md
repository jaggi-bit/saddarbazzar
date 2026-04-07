# 💳 Payment Gateway Integration Guide

This guide explains how to integrate **any** payment gateway (Safepay, Stripe, JazzCash, EasyPaisa, Razorpay, etc.) into the Sadar Bazar platform.

The architecture uses the **Strategy + Factory + Template Method** design patterns, so adding a new gateway requires **zero changes to existing code**.

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  Frontend        │────▷│  CheckoutController   │────▷│  CheckoutService      │
│  (Next.js)       │     │  POST /checkout       │     │                      │
└─────────────────┘     └──────────────────────┘     └──────────┬───────────┘
                                                                │
                                                    ┌───────────▼───────────┐
                                                    │  PaymentGatewayFactory │
                                                    │  resolves by method    │
                                                    └───────────┬───────────┘
                                                                │
                              ┌──────────────────┬──────────────┴──────────┐
                              │                  │                         │
                     ┌────────▼─────┐   ┌────────▼──────┐       ┌─────────▼────────┐
                     │ COD Gateway  │   │ Online Gateway │       │ Your New Gateway │
                     │ (built-in)   │   │ (placeholder)  │       │ (extend this)    │
                     └──────────────┘   └───────────────┘       └──────────────────┘
```

---

## Quick Start: 3 Steps to Add a New Gateway

### Step 1: Create Your Gateway Class

Create a new Java file in:
```
backend/src/main/java/com/sadarbazar/service/payment/gateways/
```

```java
package com.sadarbazar.service.payment.gateways;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.Order;
import com.sadarbazar.service.payment.AbstractPaymentGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SafepayGateway extends AbstractPaymentGateway {

    @Value("${app.payment.secret-key}")
    private String secretKey;

    @Value("${app.payment.webhook-secret}")
    private String webhookSecret;

    @Override
    public String getGatewayName() {
        return "SAFEPAY"; // Must match frontend's paymentMethod value
    }

    @Override
    protected CheckoutDTO.Response doInitialize(Order order) {
        // Call Safepay API to create a tracker
        RestTemplate rest = new RestTemplate();
        // ... your API call here ...
        String paymentUrl = "https://sandbox.getsafepay.com/checkout/pay?tracker=...";

        return CheckoutDTO.Response.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .paymentUrl(paymentUrl)
                .status("AWAITING_PAYMENT")
                .message("Redirecting to Safepay...")
                .build();
    }

    @Override
    protected boolean doVerifyWebhook(String payload, String signature) {
        // Use HMAC-SHA256 with webhookSecret — see OnlinePaymentGateway for example
        return false; // Replace with real verification
    }
}
```

**That's it!** Spring auto-discovers the `@Service` bean and the `PaymentGatewayFactory` registers it automatically.

### Step 2: Set Environment Variables

Add to your `.env` file (or system environment):

```bash
PAYMENT_GATEWAY_NAME=SAFEPAY     # Or STRIPE, JAZZCASH, etc.
PAYMENT_API_KEY=pk_live_xxx      # Your public/API key
PAYMENT_SECRET_KEY=sk_live_xxx   # Your secret key (NEVER expose to frontend)
PAYMENT_WEBHOOK_SECRET=whsec_xxx # Webhook verification secret
PAYMENT_SANDBOX=true             # Set false for production
```

These map to `application.yml` via:
```yaml
app:
  payment:
    gateway-name: ${PAYMENT_GATEWAY_NAME:ONLINE}
    api-key: ${PAYMENT_API_KEY:}
    secret-key: ${PAYMENT_SECRET_KEY:}
    webhook-secret: ${PAYMENT_WEBHOOK_SECRET:}
    sandbox: ${PAYMENT_SANDBOX:true}
```

### Step 3: Configure Webhook in Provider Dashboard

Point your payment provider's webhook URL to:
```
https://yourdomain.com/api/v1/webhooks/payment-status?gateway=SAFEPAY
```

The `gateway` query parameter tells our system which gateway should verify the signature.

---

## Frontend: Updating the Payment Method

In `frontend/src/app/checkout/page.tsx`, the payment method selector sends the `paymentMethod` string to the backend. To add your gateway to the UI, add a new radio option:

```tsx
<label className={`${styles.paymentOption} ${formData.paymentMethod === 'SAFEPAY' ? styles.paymentSelected : ''}`}>
  <div className={styles.paymentRadio}>
    <input 
      type="radio" 
      name="paymentMethod" 
      value="SAFEPAY" 
      checked={formData.paymentMethod === 'SAFEPAY'}
      onChange={() => handlePaymentSelect('SAFEPAY')}
    />
  </div>
  <div className={styles.paymentInfo}>
    <span className={styles.paymentName}>Pay with Safepay</span>
    <span className={styles.paymentDesc}>Visa, Mastercard, JazzCash, EasyPaisa</span>
  </div>
</label>
```

The `value` must match `getGatewayName()` in your backend gateway class.

---

## Webhook Flow

```
Payment Provider ───POST───▷ /api/v1/webhooks/payment-status?gateway=SAFEPAY
                                │
                                ├─ 1. Factory resolves SafepayGateway
                                ├─ 2. verifyWebhook(payload, signature)
                                ├─ 3. If valid → Order.paymentStatus = PAID
                                └─ 4. Returns 200 OK
```

The webhook endpoint reads the `X-Webhook-Signature` header. If your provider uses a different header name (e.g., `X-SFPY-SIGNATURE`), update `WebhookController.java`.

---

## Security Checklist

| Item | Status |
|------|--------|
| Secret key stored in `.env`, never in code | ✅ |
| Secret key never sent to frontend | ✅ |
| Webhook signature verified with HMAC-SHA256 | ✅ |
| Timing-safe comparison (`MessageDigest.isEqual()`) | ✅ |
| Webhook endpoint bypasses JWT auth | ✅ |
| HTTPS required in production | ⚠️ Configure in deployment |

---

## File Reference

| File | Purpose |
|------|---------|
| `PaymentGateway.java` | Core interface |
| `AbstractPaymentGateway.java` | Template Method base class |
| `PaymentGatewayFactory.java` | Auto-resolves gateways |
| `gateways/CodPaymentGateway.java` | Cash on Delivery |
| `gateways/OnlinePaymentGateway.java` | Placeholder (copy this!) |
| `WebhookController.java` | Receives provider callbacks |
| `application.yml` | Env-var config |
| `.env.example` | Required variables |

---

## Finding Your API Keys

Each payment provider has a different dashboard. Here's where to look:

### Safepay
1. Log in to [merchant.getsafepay.com](https://merchant.getsafepay.com)
2. Go to **Developers** → **API Keys**
3. Copy **Secret Key** (starts with `sec_`)
4. Copy **Publishable Key** (starts with `pk_`)
5. Go to **Developers** → **Webhooks** → Add endpoint URL

### Stripe
1. Log in to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy **Secret Key** (starts with `sk_`)
4. Go to **Developers** → **Webhooks** → Add endpoint → Copy signing secret

### JazzCash / EasyPaisa
1. Contact your account manager for API credentials
2. You'll receive a **Merchant ID**, **Password**, and **Hash Key**
3. Use the Hash Key as `PAYMENT_WEBHOOK_SECRET`

---

## Testing

For sandbox/testing, most providers offer test card numbers:

| Provider | Test Card | Expiry | CVV |
|----------|-----------|--------|-----|
| Safepay | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| Stripe | `4242 4242 4242 4242` | Any future date | Any 3 digits |
| JazzCash | Use test mobile number from docs | — | — |
