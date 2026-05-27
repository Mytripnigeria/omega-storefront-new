import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useAuth } from '@/context/AuthContext';

interface SignInSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type PhoneStep = 'idle' | 'phone' | 'code';

/**
 * Lightweight sign-in prompt shown from the bottom nav for guest users. Two
 * paths:
 *  • email + password — defers to the dedicated /login and /register pages.
 *  • phone OTP — inline 2-step flow (request code → verify), uses AuthContext
 *    so the resulting JWT lands in the same place the email login uses.
 */
export const SignInSheet = ({ isOpen, onClose }: SignInSheetProps) => {
  useBodyScrollLock(isOpen);

  const navigate = useNavigate();
  const { requestPhoneOtp, loginWithPhoneOtp } = useAuth();

  const [step, setStep] = useState<PhoneStep>('idle');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const businessId = (import.meta.env.VITE_BUSINESS_ID ?? '') as string;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const resetPhoneFlow = () => {
    setStep('idle');
    setPhone('');
    setCode('');
    setFirstName('');
    setLastName('');
    setError(null);
  };

  const closeAndReset = () => {
    resetPhoneFlow();
    onClose();
  };

  const sendCode = async () => {
    if (!phone.trim()) {
      setError('Enter your phone number');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await requestPhoneOtp({ businessId, phone: phone.trim(), purpose: 'login' });
      setStep('code');
    } catch (e) {
      setError((e as Error).message ?? "Couldn't send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError('Enter the code from your SMS');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await loginWithPhoneOtp({
        businessId,
        phone: phone.trim(),
        code: code.trim(),
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      closeAndReset();
    } catch (e) {
      const msg = (e as Error).message ?? "Couldn't verify code";
      // Backend asks for firstName + lastName when this is a first-time signup.
      if (/first.*last.*name/i.test(msg)) {
        setError('New here? Add your name to finish signing up.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300 safari-fix',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          'lg:flex lg:items-center lg:justify-center',
        )}
        onClick={closeAndReset}
      />

      {/* Sheet - Bottom sheet on mobile, centered dialog on desktop */}
      <div
        className={cn(
          'fixed z-50 bg-card shadow-none border border-border transition-all duration-300 safari-fix',
          'inset-x-0 bottom-0 rounded-t-3xl',
          isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none invisible',
          'lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md',
          isOpen
            ? 'lg:-translate-y-1/2 lg:opacity-100 lg:visible lg:pointer-events-auto'
            : 'lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none lg:invisible',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold">
            {step === 'idle' ? 'Sign in' : step === 'phone' ? 'Continue with phone' : 'Enter your code'}
          </h2>
          <button
            onClick={closeAndReset}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-6 safe-bottom-pad space-y-3">
          {step === 'idle' && (
            <>
              <p className="text-muted-foreground text-sm mb-2">
                Sign in to save your orders, earn points, and more.
              </p>
              <Button onClick={() => go('/login')} className="w-full h-12 rounded-full">
                Sign in
              </Button>
              <Button
                onClick={() => go('/register')}
                variant="outline"
                className="w-full h-12 rounded-full"
              >
                Create an account
              </Button>
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                onClick={() => setStep('phone')}
                variant="outline"
                className="w-full h-12 rounded-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Continue with phone
              </Button>
            </>
          )}

          {step === 'phone' && (
            <>
              <button
                onClick={resetPhoneFlow}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <div>
                <label className="text-sm font-medium">Phone number</label>
                <Input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 h-12"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-2">
                  We'll text you a 6-digit code to sign in.
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={sendCode}
                disabled={busy}
                className="w-full h-12 rounded-full"
              >
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send code
              </Button>
            </>
          )}

          {step === 'code' && (
            <>
              <button
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Use a different number
              </button>
              <p className="text-sm text-muted-foreground">
                Enter the code we sent to{' '}
                <span className="font-medium text-foreground">{phone}</span>.
              </p>
              <div>
                <label className="text-sm font-medium">Verification code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1.5 h-12 tracking-widest text-center text-lg"
                  autoFocus
                  maxLength={8}
                />
              </div>
              {error && (
                <div className="space-y-3 pt-1">
                  <p className="text-sm text-destructive">{error}</p>
                  {/first.*last.*name/i.test(error ?? '') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12"
                      />
                      <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12"
                      />
                    </div>
                  )}
                </div>
              )}
              <Button
                onClick={verifyCode}
                disabled={busy}
                className="w-full h-12 rounded-full"
              >
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify and continue
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};
