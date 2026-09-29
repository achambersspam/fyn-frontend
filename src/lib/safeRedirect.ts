const STRIPE_HOSTS = new Set(["checkout.stripe.com", "billing.stripe.com"]);

/** Only navigate to Stripe-hosted checkout/portal pages returned by our API. */
export function isStripeUrl(raw: string | null | undefined): raw is string {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && STRIPE_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}
