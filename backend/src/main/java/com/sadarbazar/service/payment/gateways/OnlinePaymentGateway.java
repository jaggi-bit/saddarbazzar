package com.sadarbazar.service.payment.gateways;

import com.sadarbazar.dto.CheckoutDTO;
import com.sadarbazar.entity.Order;
import com.sadarbazar.service.payment.AbstractPaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Placeholder online payment gateway.
 * <p>
 * This class demonstrates the full contract for integrating any online payment
 * provider (Safepay, Stripe, JazzCash, EasyPaisa, etc.).
 * <p>
 * <b>To integrate a real gateway:</b>
 * <ol>
 *   <li>Replace {@link #doInitialize(Order)} with your provider's API call.</li>
 *   <li>Replace {@link #doVerifyWebhook(String, String)} with your provider's HMAC scheme.</li>
 *   <li>Update {@link #getGatewayName()} to match your frontend's paymentMethod value.</li>
 *   <li>Add your credentials to {@code .env} and {@code application.yml}.</li>
 * </ol>
 *
 * @see com.sadarbazar.service.payment.AbstractPaymentGateway
 */
@Slf4j
@Service
public class OnlinePaymentGateway extends AbstractPaymentGateway {

    @Value("${app.payment.gateway-name:ONLINE}")
    private String gatewayName;

    @Value("${app.payment.api-key:}")
    private String apiKey;

    @Value("${app.payment.secret-key:}")
    private String secretKey;

    @Value("${app.payment.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.payment.sandbox:true}")
    private boolean isSandbox;

    @Override
    public String getGatewayName() {
        return gatewayName;
    }

    /**
     * Initialize a payment session with the external provider.
     * <p>
     * <b>Replace this method</b> with your provider-specific API call.
     * For example, with Safepay you would:
     * <pre>
     *   1. POST to https://sandbox.api.getsafepay.com/order/v1/init
     *      with { client: secretKey, amount, currency: "PKR" }
     *   2. Extract the tracker token from the response
     *   3. Build the checkout URL: https://sandbox.getsafepay.com/checkout/pay?tracker={token}
     * </pre>
     */
    @Override
    protected CheckoutDTO.Response doInitialize(Order order) {
        // Validate credentials are configured
        if (secretKey == null || secretKey.isBlank()) {
            log.warn("[{}] No secret key configured. Returning placeholder response.", getGatewayName());
            return CheckoutDTO.Response.builder()
                    .orderId(order.getId())
                    .totalAmount(order.getTotalAmount())
                    .status("GATEWAY_NOT_CONFIGURED")
                    .message("Payment gateway credentials are not configured. " +
                             "Please set app.payment.secret-key in your environment.")
                    .build();
        }

        // ===================================================================
        // TODO: REPLACE THIS BLOCK WITH YOUR GATEWAY'S API CALL
        // ===================================================================
        //
        // Example pseudocode for any gateway:
        //
        //   RestTemplate rest = new RestTemplate();
        //   Map<String, Object> payload = Map.of(
        //       "api_key", secretKey,
        //       "amount", order.getTotalAmount(),
        //       "currency", "PKR",
        //       "order_id", order.getId().toString()
        //   );
        //   ResponseEntity<Map> resp = rest.postForEntity(apiUrl, payload, Map.class);
        //   String token = (String) resp.getBody().get("token");
        //   String paymentUrl = checkoutBaseUrl + "?token=" + token;
        //
        // ===================================================================

        String placeholderUrl = isSandbox
                ? "https://sandbox.yourgateway.com/checkout?order=" + order.getId()
                : "https://yourgateway.com/checkout?order=" + order.getId();

        return CheckoutDTO.Response.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .paymentUrl(placeholderUrl)
                .paymentToken("placeholder-token-" + order.getId())
                .status("AWAITING_PAYMENT")
                .message("Redirecting to payment gateway...")
                .build();
    }

    /**
     * Verify an incoming webhook using HMAC-SHA256.
     * <p>
     * <b>Replace the HMAC algorithm</b> if your provider uses a different scheme.
     * Most providers (Safepay, Stripe, Razorpay) use HMAC-SHA256.
     *
     * @param payload   Raw JSON body from the webhook request.
     * @param signature The signature header (e.g., X-Signature, X-SFPY-SIGNATURE).
     * @return true if signatures match.
     */
    @Override
    protected boolean doVerifyWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("[{}] Webhook secret is not configured! Cannot verify.", getGatewayName());
            return false;
        }

        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(keySpec);

            byte[] computedHash = hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String computedSignature = HexFormat.of().formatHex(computedHash);

            // Timing-safe comparison to prevent timing attacks
            return MessageDigest.isEqual(
                    computedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("[{}] HMAC verification error: {}", getGatewayName(), e.getMessage());
            return false;
        }
    }
}
