'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import Aurora from '@/components/ui/Aurora';
import { Logo } from '@/components/ui/logo';
import { Eye, EyeOff, Loader2, Check, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { useDebounce } from '@/hooks/use-debounce';
import { InputOTPForm } from '@/components/ui/otp-page';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000').replace(/\/api$/, '');

const REGISTRATION_NUMBER_PATTERN = /^[UL]\d{5}[A-Z]{2}\d{4}(PTC|PLC|LLP|OPC)\d{6}$/i;

const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman & Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CG', label: 'Chhattisgarh' },
  { value: 'DD', label: 'Daman & Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu & Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OD', label: 'Odisha' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'PB', label: 'Punjab' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TS', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UK', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
];


type AuthStep = 'FORM' | 'EMAIL_VERIFY' | 'TWO_FA' | 'SUCCESS';

interface FirmAuthFormProps {
  mode: 'login' | 'register';
}

export default function FirmAuthForm({ mode }: FirmAuthFormProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [step, setStep] = useState<AuthStep>('FORM');

  const [tempToken, setTempToken] = useState('');
  const [firmId, setFirmId] = useState('');       // needed for verify-email (firm uses firmId not email)
  const [isNewIp, setIsNewIp] = useState(false);  // backend warns on new IP login

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [name, setName] = useState('');           // admin contact name
  const [firmName, setFirmName] = useState('');
  const [phone, setPhone] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [gstNumber, setGstNumber] = useState(''); // optional
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');     // optional

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedPhone = useDebounce(phone, 500);
  const debouncedRegNumber = useDebounce(registrationNumber, 500);
  const debouncedGst = useDebounce(gstNumber, 500);
  const [phoneValid, setPhoneValid] = useState(false);
  const [regNumberValid, setRegNumberValid] = useState(false);
  const [gstValid, setGstValid] = useState(true); // optional — valid if empty

  useEffect(() => {
    setIsLogin(mode === 'login');
    setStep('FORM');
  }, [mode]);

  useEffect(() => {
    setPhoneValid(debouncedPhone.length === 10 && /^\d+$/.test(debouncedPhone));
  }, [debouncedPhone]);

  useEffect(() => {
    setRegNumberValid(
      debouncedRegNumber.length > 0 && REGISTRATION_NUMBER_PATTERN.test(debouncedRegNumber)
    );
  }, [debouncedRegNumber]);

  useEffect(() => {
    if (!debouncedGst) { setGstValid(true); return; }
    setGstValid(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i.test(debouncedGst));
  }, [debouncedGst]);

  const toggleAuthMode = () => {
    router.push(isLogin ? '/auth/firm?action=register' : '/auth/firm?action=login');
  };

  const autoLoginAfterVerify = async () => {
    const response = await fetch(`${API_BASE_URL}/api/firm/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Auto-login failed');
    if (data.success && data.data) {
      setTempToken(data.data.twoFactorToken);
      setIsNewIp(data.data.isNewIp || false);
      setStep('TWO_FA');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Validation Error', { description: 'Please fill in all required fields.' });
      return;
    }

    if (!isLogin) {
      if (!name || !firmName || !phone || !registrationNumber || !city || !state) {
        toast.error('Validation Error', { description: 'Please fill in all required fields.' });
        return;
      }
      if (!phoneValid) {
        toast.error('Validation Error', { description: 'Enter a valid 10-digit Indian phone number.' });
        return;
      }
      if (!regNumberValid) {
        toast.error('Validation Error', { description: 'Enter a valid MCA21 company registration number. e.g. U74999MH2010PTC123456' });
        return;
      }
      if (gstNumber && !gstValid) {
        toast.error('Validation Error', { description: 'Enter a valid 15-character GST number.' });
        return;
      }
      if (password.length < 12) {
        toast.error('Validation Error', { description: 'Password must be at least 12 characters.' });
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Validation Error', { description: 'Passwords do not match.' });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${API_BASE_URL}/api/firm/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (data.success && data.data) {
          setTempToken(data.data.twoFactorToken);
          setIsNewIp(data.data.isNewIp || false);
          setStep('TWO_FA');
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/api/firm/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, password, name, firmName, phone,
            registrationNumber,
            ...(gstNumber && { gstNumber }),
            city, state,
            ...(address && { address }),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        if (data.success && data.data) {
          setFirmId(data.data.firm.id);
          toast.success('Firm Account Created!');
          setStep('EMAIL_VERIFY');
        }
      }
    } catch (error) {
      toast.error('Authentication Failed', { description: error instanceof Error ? error.message : 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/firm/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmId, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Email verification failed');

      toast.success('Email Verified!');
      await autoLoginAfterVerify();
    } catch (error) {
      toast.error('Verification Failed', { description: error instanceof Error ? error.message : 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFaOTP = async (otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/firm/auth/login/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorToken: tempToken, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '2FA verification failed');

      if (data.success && data.data) {
        localStorage.setItem('firmAuthToken', data.data.accessToken);
        localStorage.setItem('firmRefreshToken', data.data.refreshToken);
        localStorage.setItem('firmUser', JSON.stringify({
          id: data.data.firm.id,
          name: data.data.firm.name,
          email: data.data.firm.email,
          firmName: data.data.firm.firmName,
          userType: 'FIRM_ADMIN',
        }));

        toast.success('Welcome!');
        setStep('SUCCESS');
        setTimeout(() => router.push('/firm/dashboard'), 1500);
      }
    } catch (error) {
      toast.error('2FA Verification Failed', { description: error instanceof Error ? error.message : 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'EMAIL_VERIFY') setStep('FORM');
    else if (step === 'TWO_FA' && !isLogin) setStep('EMAIL_VERIFY');
    else if (step === 'TWO_FA' && isLogin) setStep('FORM');
    else setStep('FORM');
  };

  const getLeftPanelContent = () => {
    switch (step) {
      case 'FORM':
        return {
          heading: isLogin ? 'Firm Sign In' : 'Register Your Firm',
          subtext: isLogin ? 'Welcome back' : 'Create your law firm account',
        };
      case 'EMAIL_VERIFY':
        return { heading: 'Verify Your Email', subtext: 'Check your inbox for the code' };
      case 'TWO_FA':
        return { heading: 'Two-Factor Authentication', subtext: 'Secure your firm account' };
      case 'SUCCESS':
        return { heading: 'Welcome!', subtext: 'Redirecting to your dashboard...' };
    }
  };

  const leftPanel = getLeftPanelContent();


  return (
    <div className="h-screen w-full flex flex-col md:flex-row gap-4 p-4 bg-background">
      {/* Left — Aurora branding panel (fixed) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-[#060010] rounded-2xl">
        <div className="absolute inset-0">
          <Aurora
            colorStops={["#060010", "#f0c6a3", "#b36b76"]}
            blend={0.3}
            amplitude={0.5}
            speed={0.4}
          />
        </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-12 text-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <h1 className="text-5xl font-bold tracking-tight text-white mt-4">
                LegalAI
              </h1>
              <p className="text-blue-200/70 text-base max-w-s leading-relaxed">
                AI-powered legal intelligence for professionals
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col gap-3 w-full max-w-[280px]"
              >
                <h2 className="text-2xl font-semibold text-white">
                  {leftPanel.heading}
                </h2>
                <p className="text-blue-200/70 text-sm">
                  {leftPanel.subtext}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-3 w-full max-w-[260px]"
            >
              <Button
                variant="default"
                onClick={() => router.push('/#home')}
                className="w-full bg-gradient-to-b from-[#c9a882] to-[#8a6245] text-white/90 font-medium h-11 gap-2 shadow-inner cursor-pointer hover:text-white"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </motion.div>
          </div>
      </div>

      {/* Right — Auth content */}
      <div className={`flex-1 px-4 py-10 md:px-8 ${step === 'FORM' && !isLogin ? 'overflow-y-auto' : 'flex items-center justify-center'}`}>
        <AnimatePresence mode="wait">
          {step === 'FORM' && (
            <motion.div
              key="form"
              className={`w-full ${!isLogin ? 'max-w-sm mx-auto' : 'max-w-sm'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile logo */}
              <div className="flex items-center justify-center mb-8 md:hidden">
                <Logo showText className="scale-110" />
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.h2
                  className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
                  key={isLogin ? 'login-h' : 'register-h'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isLogin ? 'Firm Sign in' : 'Firm Sign up'}
                </motion.h2>
                <motion.p
                  className="text-gray-500 dark:text-zinc-400 text-sm mt-2"
                  key={isLogin ? 'login-p' : 'register-p'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  {isLogin
                    ? 'Welcome back! Please sign in to continue.'
                    : 'Create your firm account to get started.'}
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-zinc-300 text-sm">Admin Contact Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Admin Contact Name"
                        required
                        className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firmName" className="text-gray-700 dark:text-zinc-300 text-sm">Firm Name</Label>
                      <Input
                        id="firmName"
                        type="text"
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        placeholder="Enter Firm Name"
                        required
                        className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 dark:text-zinc-300 text-sm">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter Phone Number"
                          required
                          className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        />
                        {phoneValid && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber" className="text-gray-700 dark:text-zinc-300 text-sm">Registration Number</Label>
                      <div className="relative">
                        <Input
                          id="registrationNumber"
                          type="text"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          placeholder="e.g. U74999MH2010PTC123456"
                          required
                          className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        />
                        {regNumberValid && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstNumber" className="text-gray-700 dark:text-zinc-300 text-sm">GST Number <span className="text-gray-400">(Optional)</span></Label>
                      <div className="relative">
                        <Input
                          id="gstNumber"
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="Enter GST Number"
                          className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        />
                        {gstValid && gstNumber && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-700 dark:text-zinc-300 text-sm">City</Label>
                        <Input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter City"
                          required
                          className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-gray-700 dark:text-zinc-300 text-sm">State</Label>
                        <Select value={state} onValueChange={setState}>
                          <SelectTrigger className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((stateOption) => (
                              <SelectItem key={stateOption.value} value={stateOption.value}>
                                {stateOption.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-700 dark:text-zinc-300 text-sm">Address <span className="text-gray-400">(Optional)</span></Label>
                      <Input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter Address"
                        className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-zinc-300 text-sm">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Your Email"
                    required
                    className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-zinc-300 text-sm">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-zinc-300 text-sm">Confirm Password</Label>
                        <div className="relative">
                            <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                            <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                            >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  disabled={isLoading || !email || !password || (!isLogin && (!name || !firmName || !phoneValid || !regNumberValid || !city || !state || Boolean(gstNumber && !gstValid)))}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    isLogin ? 'Continue' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Toggle auth mode */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500 dark:text-zinc-500">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-gray-900 dark:text-white font-semibold hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {step === 'EMAIL_VERIFY' && (
            <motion.div
              key="email-verify"
              className="w-full max-w-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <InputOTPForm
                title="Verify your email"
                description={`Enter the verification code sent to ${email}`}
                onSubmit={handleEmailVerifyOTP}
              />
              {isLoading && (
                <div className="flex items-center justify-center mt-4 gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </div>
              )}
            </motion.div>
          )}

          {step === 'TWO_FA' && (
            <motion.div
              key="two-fa"
              className="w-full max-w-md"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <InputOTPForm
                title="Two-Factor Authentication"
                description="Enter the verification code sent to your email"
                onSubmit={handleTwoFaOTP}
              />
              {isNewIp && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">New IP Address Detected</p>
                      <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                        We've detected a login from a new IP address. For security, please verify with 2FA.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {isLoading && (
                <div className="flex items-center justify-center mt-4 gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </div>
              )}
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div
              key="success"
              className="w-full max-w-md text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome!
                </h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm">
                  Redirecting you to your dashboard...
                </p>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
