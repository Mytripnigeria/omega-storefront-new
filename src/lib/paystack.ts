/**
 * Shared Paystack inline-checkout helper. Both checkout and the wallet top-up
 * drive the same popup, so the loader and launch logic live here.
 *
 * IMPORTANT — why `PaystackPop.setup().openIframe()` and NOT the backend
 * `initialize` + `resumeTransaction` flow:
 *
 *   - v1 `inline.js` exposes `window.PaystackPop` as an OBJECT with a `.setup()`
 *     method — it is NOT a constructor, and it has no `resumeTransaction`. Our
 *     earlier attempt to call `new PaystackPop().resumeTransaction(accessCode)`
 *     therefore always failed and fell back to a full-page REDIRECT (the client
 *     reported "paystack redirects instead of popup"). `resumeTransaction` is a
 *     v2 (`@paystack/inline-js`) API.
 *   - The ORIGINAL "duplicate reference" bug happened because the backend called
 *     `/transaction/initialize` AND the popup initialised the same reference a
 *     second time. The backend now does NOT pre-initialise — it only hands us
 *     the reference it stamped on the order + the public key + the amount. So
 *     `setup({ ref })` performs the single, only initialisation → a real popup,
 *     no duplicate. The amount is re-verified server-side, so a tampered popup
 *     amount can never complete the order.
 */

export interface PaystackInline {
  setup(opts: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    currency?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (tx: { reference: string }) => void;
    onLoad?: (resp: unknown) => void;
    onCancel?: () => void;
    /** Legacy callback name kept for older inline.js builds. */
    callback?: (tx: { reference: string }) => void;
    onClose?: () => void;
  }): { openIframe(): void };
}

declare global {
  interface Window {
    PaystackPop?: PaystackInline;
  }
}

const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";
const PAYSTACK_LOAD_TIMEOUT_MS = 10_000;

export function ensurePaystackLoaded(): Promise<PaystackInline> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYSTACK_SCRIPT}"]`,
    );
    const timer = setTimeout(() => {
      reject(new Error("Paystack didn't load in time. Please retry."));
    }, PAYSTACK_LOAD_TIMEOUT_MS);
    const onLoad = () => {
      clearTimeout(timer);
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Failed to load Paystack"));
    };
    const onError = () => {
      clearTimeout(timer);
      reject(new Error("Failed to load Paystack"));
    };
    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.body.appendChild(script);
  });
}

export interface PaystackLaunchParams {
  /** Merchant public key (from the backend). */
  publicKey: string;
  /** Customer email. */
  email: string;
  /** Amount in kobo (server-authoritative). */
  amountKobo: number;
  /** The reference the backend stamped on the order/deposit. */
  reference: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackHandlers {
  onSuccess: (reference: string) => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

/**
 * Opens the Paystack inline popup for a reference the backend already created
 * (but did NOT initialise on Paystack). This is the single initialisation, so
 * there is no duplicate-reference error and it is always a popup — never a
 * redirect.
 */
export async function openPaystack(
  params: PaystackLaunchParams,
  handlers: PaystackHandlers,
): Promise<void> {
  const PaystackPop = await ensurePaystackLoaded();

  if (!params.publicKey || !params.reference) {
    throw new Error("Payment could not be started. Please retry.");
  }

  const succeed = (tx: { reference: string }) =>
    void handlers.onSuccess(tx?.reference ?? params.reference);

  const handler = PaystackPop.setup({
    key: params.publicKey,
    email: params.email,
    amount: Math.round(params.amountKobo),
    ref: params.reference,
    currency: "NGN",
    metadata: params.metadata,
    onSuccess: succeed,
    // Older inline.js builds fire `callback` rather than `onSuccess`.
    callback: succeed,
    onCancel: handlers.onCancel,
    onClose: handlers.onClose,
  });
  handler.openIframe();
}
