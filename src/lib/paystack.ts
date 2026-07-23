/**
 * Shared Paystack inline-checkout helper.
 *
 * Both checkout and the wallet top-up drive the same popup, so the loader and
 * the launch logic live here rather than being duplicated.
 *
 * IMPORTANT — why `resumeTransaction` and not `setup({ ref })`:
 * the backend has already called Paystack `/transaction/initialize` and holds
 * the resulting access code. Calling `setup({ ref })` makes inline.js
 * initialise the *same reference a second time*, which Paystack rejects with
 * "Duplicate Transaction Reference" — the popup then never fires onSuccess and
 * the customer is stranded. `resumeTransaction(accessCode)` attaches to the
 * transaction the server already created, and takes its amount from that
 * server-side initialisation, so the client can't disagree about the price
 * either.
 */

export interface PaystackInline {
  /** Legacy API — kept only as a fallback for older inline.js builds. */
  setup?(opts: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onSuccess: (tx: { reference: string }) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }): { openIframe(): void };
  new (): PaystackPopInstance;
}

export interface PaystackPopInstance {
  resumeTransaction(
    accessCode: string,
    callbacks?: {
      onSuccess?: (tx: { reference: string }) => void;
      onCancel?: () => void;
      onClose?: () => void;
      onError?: (err: unknown) => void;
    },
  ): void;
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

export interface PaystackInitialization {
  accessCode?: string;
  authorizationUrl?: string;
  reference?: string;
}

export interface PaystackHandlers {
  onSuccess: (reference: string) => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

/**
 * Opens the popup for a transaction the server already initialised. Resolves
 * once the popup has been handed control; the outcome arrives via `handlers`.
 * Falls back to a full-page redirect when the loaded inline.js is too old to
 * expose `resumeTransaction`.
 */
export async function openPaystack(
  init: PaystackInitialization,
  handlers: PaystackHandlers,
): Promise<void> {
  const PaystackPop = await ensurePaystackLoaded();

  if (!init.accessCode) {
    if (init.authorizationUrl) {
      window.location.href = init.authorizationUrl;
      return;
    }
    throw new Error("Payment could not be started. Please retry.");
  }

  const instance =
    typeof PaystackPop === "function" ? new PaystackPop() : undefined;

  if (!instance || typeof instance.resumeTransaction !== "function") {
    // Old inline.js: redirect instead of re-initialising the reference.
    if (init.authorizationUrl) {
      window.location.href = init.authorizationUrl;
      return;
    }
    throw new Error("Payment could not be started. Please retry.");
  }

  instance.resumeTransaction(init.accessCode, {
    onSuccess: (tx) => {
      void handlers.onSuccess(tx?.reference ?? init.reference ?? "");
    },
    onCancel: handlers.onCancel,
    onClose: handlers.onClose,
  });
}
