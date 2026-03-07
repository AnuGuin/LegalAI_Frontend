'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Logo } from '@/components/ui/logo';
import { Eye, EyeOff, Loader2, Check, ArrowLeft, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';
import { InputOTPForm } from '@/components/ui/otp-page';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000").replace(/\/api$/, '');

const BAR_NUMBER_PATTERNS: Record<string, { pattern: RegExp; example: string }> = {
  DELHI:          { pattern: /^D\/\d{4}\/\d{4,6}$/i,         example: 'D/2010/1234' },
  MAHARASHTRA:    { pattern: /^MAH\/\d{4}\/\d{4,6}$/i,       example: 'MAH/2010/12345' },
  KARNATAKA:      { pattern: /^KAR\/\d{4}\/\d{4,6}$/i,       example: 'KAR/2010/1234' },
  TAMIL_NADU:     { pattern: /^TN\/\d{4}\/\d{4,6}$/i,        example: 'TN/2010/1234' },
  KERALA:         { pattern: /^KER\/\d{4}\/\d{4,6}$/i,       example: 'KER/2010/1234' },
  GUJARAT:        { pattern: /^GUJ\/\d{4}\/\d{4,6}$/i,       example: 'GUJ/2010/1234' },
  RAJASTHAN:      { pattern: /^RAJ\/\d{4}\/\d{4,6}$/i,       example: 'RAJ/2010/1234' },
  WEST_BENGAL:    { pattern: /^WB\/\d{4}\/\d{4,6}$/i,        example: 'WB/2010/1234' },
  ANDHRA_PRADESH: { pattern: /^AP\/\d{4}\/\d{4,6}$/i,        example: 'AP/2010/1234' },
  TELANGANA:      { pattern: /^TS\/\d{4}\/\d{4,6}$/i,        example: 'TS/2010/1234' },
  UTTAR_PRADESH:  { pattern: /^UP\/\d{4}\/\d{4,6}$/i,        example: 'UP/2010/1234' },
  BIHAR:          { pattern: /^BIH\/\d{4}\/\d{4,6}$/i,       example: 'BIH/2010/1234' },
  PUNJAB_HARYANA: { pattern: /^PH\/\d{4}\/\d{4,6}$/i,        example: 'PH/2010/1234' },
  MADHYA_PRADESH: { pattern: /^MP\/\d{4}\/\d{4,6}$/i,        example: 'MP/2010/1234' },
  ODISHA:         { pattern: /^ORI\/\d{4}\/\d{4,6}$/i,       example: 'ORI/2010/1234' },
  ASSAM:          { pattern: /^ASM\/\d{4}\/\d{4,6}$/i,       example: 'ASM/2010/1234' },
  GOA:            { pattern: /^GOA\/\d{4}\/\d{4,6}$/i,       example: 'GOA/2010/1234' },
  HIMACHAL:       { pattern: /^HP\/\d{4}\/\d{4,6}$/i,        example: 'HP/2010/1234' },
  SUPREME_COURT:  { pattern: /^SC\/\d{4}\/\d{4,6}$/i,        example: 'SC/2010/1234' },
};

type AuthStep = 'FORM' | 'EMAIL_VERIFY' | 'PROFILE_COMPLETE' | 'TWO_FA' | 'SUCCESS';

interface LawyerAuthFormProps {
  mode: 'login' | 'register';
}

interface ProfileData {
  phone: string;
  barCouncilState: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  barNumber: string;
}

export default function LawyerAuthForm({ mode }: LawyerAuthFormProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [step, setStep] = useState<AuthStep>('FORM');

  const [tempToken, setTempToken] = useState('');
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<ProfileData | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [barCouncilState, setBarCouncilState] = useState('');
  const [practiceAreas, setPracticeAreas] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [barNumber, setBarNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  const debouncedPhone = useDebounce(phone, 500);
  const debouncedBarNumber = useDebounce(barNumber, 500);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [barNumberVerified, setBarNumberVerified] = useState(false);

  useEffect(() => {
    setIsLogin(mode === 'login');
    setStep('FORM');
  }, [mode]);

  useEffect(() => {
    setPhoneVerified(debouncedPhone.length === 10 && /^\d+$/.test(debouncedPhone));
  }, [debouncedPhone]);

  useEffect(() => {
    if (!barCouncilState || !debouncedBarNumber) {
      setBarNumberVerified(false);
      return;
    }
    const entry = BAR_NUMBER_PATTERNS[barCouncilState];
    setBarNumberVerified(entry ? entry.pattern.test(debouncedBarNumber) : debouncedBarNumber.length > 0);
  }, [debouncedBarNumber, barCouncilState]);

  const toggleAuthMode = () => {
    router.push(isLogin ? '/auth/lawyer/register' : '/auth/lawyer/login');
  };


  /** Auto-login after email verification (register path) */
  const autoLoginAfterVerify = async () => {
    const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Auto-login failed');
    if (data.success && data.data) {
      setTempToken(data.data.twoFactorToken);
      setStep('TWO_FA');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    if (!isLogin) {
      if (!name || !phone || !barCouncilState || practiceAreas.filter(a => a.trim()).length === 0 || !yearsOfExperience || !barNumber) {
        toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
        return;
      }
      if (!phoneVerified || !barNumberVerified) {
        toast({ title: "Validation Error", description: "Please verify phone and bar number.", variant: "destructive" });
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (data.success && data.data) {
          setTempToken(data.data.twoFactorToken);
          setStep('TWO_FA');
        }
      } else {
        
        const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email, password, name, phone, barCouncilState, practiceAreas,
            yearsOfExperience: parseInt(yearsOfExperience),
            barNumber,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        if (data.success) {
          toast({ title: "Account Created!", description: "Please verify your email to continue." });
          setStep('EMAIL_VERIFY');
        }
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleEmailVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Email verification failed');

      toast({ title: "Email Verified!", description: "Proceeding to login verification..." });

      await autoLoginAfterVerify();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleTwoFaOTP = async (otp: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/login/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorToken: tempToken, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || '2FA verification failed');

      if (data.success && data.data) {
        localStorage.setItem('authToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
        name: data.data.lawyer.name,
        email: data.data.lawyer.email,
        }));

        if (isNewGoogleUser && pendingProfileData) {
          await fetch(`${API_BASE_URL}/api/lawyer/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.data.accessToken}`,
            },
            body: JSON.stringify(pendingProfileData),
          });
        }

        toast({ title: 'Success!', description: 'Logged in successfully.' });
        setStep('SUCCESS');
        setTimeout(() => router.push('/ai'), 1500);
      }
    } catch (error) {
      toast({
        title: "2FA Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/api/lawyer/auth/google/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google sign-in failed');

      if (data.success && data.data) {
        setTempToken(data.data.twoFactorToken);

        if (data.data.profileComplete) {
          setIsNewGoogleUser(false);
          setStep('TWO_FA');
        } else {
          setIsNewGoogleUser(true);
          // email/name come from Firebase result directly, not from backend response
          setEmail(result.user.email || '');
          setName(result.user.displayName || '');
          setStep('PROFILE_COMPLETE');
        }
      }
    } catch (error) {
      if (!(error instanceof Error && error.message.includes('popup-closed-by-user'))) {
        toast({
          title: 'Google Sign-In Failed',
          description: error instanceof Error ? error.message : 'An error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      // Sign out of Firebase session regardless — we use our own JWT from here
      try { await firebaseAuth.signOut(); } catch (_) {}
      setIsGoogleLoading(false);
    }
  };


  const handleProfileComplete = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !barCouncilState || practiceAreas.filter(a => a.trim()).length === 0 || !yearsOfExperience || !barNumber) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!phoneVerified || !barNumberVerified) {
      toast({ title: "Validation Error", description: "Please verify phone and bar number.", variant: "destructive" });
      return;
    }

    setPendingProfileData({
      phone,
      barCouncilState,
      practiceAreas: practiceAreas.filter(a => a.trim()),
      yearsOfExperience: parseInt(yearsOfExperience),
      barNumber,
    });

    setStep('TWO_FA');
  };


  const handleBack = () => {
    if (step === 'EMAIL_VERIFY') setStep('FORM');
    else if (step === 'TWO_FA' && !isLogin && !isNewGoogleUser) setStep('EMAIL_VERIFY');
    else if (step === 'TWO_FA' && isNewGoogleUser) setStep('PROFILE_COMPLETE');
    else if (step === 'TWO_FA' && isLogin) setStep('FORM');
    else if (step === 'PROFILE_COMPLETE') setStep('FORM');
    else setStep('FORM');
  };


  const getLeftPanelContent = () => {
    switch (step) {
      case 'FORM':
        return {
          heading: isLogin ? 'Signing In as a Lawyer' : 'Signing Up as a Lawyer',
          subtext: isLogin ? 'Welcome Back' : 'Register Yourself',
        };
      case 'EMAIL_VERIFY':
        return { heading: 'Verify Your Email', subtext: 'Check your inbox for the code' };
      case 'PROFILE_COMPLETE':
        return { heading: 'Complete Your Profile', subtext: 'Just a few more details' };
      case 'TWO_FA':
        return { heading: 'Two-Factor Authentication', subtext: 'One last step to secure your account' };
      case 'SUCCESS':
        return { heading: 'Welcome!', subtext: 'Redirecting you...' };
    }
  };

  const leftPanel = getLeftPanelContent();


  return (
    <div className="h-screen w-full flex flex-col md:flex-row">
      {/* Left — Aurora branding panel (fixed) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <AuroraBackground className="!h-full !min-h-0 w-full dark:bg-slate-950 bg-slate-950">
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <h1 className="text-5xl font-bold tracking-tight text-white mt-4">
                LegalAI
              </h1>
              <p className="text-blue-200/70 text-base max-w-xs leading-relaxed">
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
                className="w-full bg-accent-foreground backdrop-blur-sm text-blue-700 hover:bg-emerald-50 hover:border-blue-400/50 transition-all duration-300 h-11 gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </motion.div>
          </div>
        </AuroraBackground>
      </div>

      {/* Right — Auth content */}
      <div className={`flex-1 bg-white dark:bg-zinc-900 px-4 py-10 md:px-8 ${step === 'FORM' && !isLogin ? 'overflow-y-auto' : 'flex items-center justify-center'}`}>
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
                  {isLogin ? 'Lawyer Sign in' : 'Lawyer Sign up'}
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
                    : 'Create your lawyer account to get started.'}
                </motion.p>
              </div>

              {/* Google button */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors gap-3 font-medium"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-zinc-900 px-3 text-gray-400 dark:text-zinc-500">or</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 dark:text-zinc-300 text-sm">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Your Name"
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
                        {phoneVerified && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barCouncilState" className="text-gray-700 dark:text-zinc-300 text-sm">Bar Council State</Label>
                      <Select value={barCouncilState} onValueChange={setBarCouncilState}>
                        <SelectTrigger className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DELHI">Delhi</SelectItem>
                          <SelectItem value="MAHARASHTRA">Maharashtra</SelectItem>
                          <SelectItem value="KARNATAKA">Karnataka</SelectItem>
                          <SelectItem value="TAMIL_NADU">Tamil Nadu</SelectItem>
                          <SelectItem value="KERALA">Kerala</SelectItem>
                          <SelectItem value="WEST_BENGAL">West Bengal</SelectItem>
                          <SelectItem value="GUJARAT">Gujarat</SelectItem>
                          <SelectItem value="RAJASTHAN">Rajasthan</SelectItem>
                          <SelectItem value="ANDHRA_PRADESH">Andhra Pradesh</SelectItem>
                          <SelectItem value="TELANGANA">Telangana</SelectItem>
                          <SelectItem value="UTTAR_PRADESH">Uttar Pradesh</SelectItem>
                          <SelectItem value="BIHAR">Bihar</SelectItem>
                          <SelectItem value="PUNJAB_HARYANA">Punjab &amp; Haryana</SelectItem>
                          <SelectItem value="MADHYA_PRADESH">Madhya Pradesh</SelectItem>
                          <SelectItem value="ODISHA">Odisha</SelectItem>
                          <SelectItem value="ASSAM">Assam</SelectItem>
                          <SelectItem value="GOA">Goa</SelectItem>
                          <SelectItem value="HIMACHAL">Himachal Pradesh</SelectItem>
                          <SelectItem value="SUPREME_COURT">Supreme Court</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="practiceAreas" className="text-gray-700 dark:text-zinc-300 text-sm">Practice Areas</Label>
                      <Input
                        id="practiceAreas"
                        type="text"
                        value={practiceAreas.join(', ')}
                        onChange={(e) => setPracticeAreas(e.target.value.split(',').map(s => s.trim()))}
                        placeholder="e.g. Criminal Law, Civil Law"
                        required
                        className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience" className="text-gray-700 dark:text-zinc-300 text-sm">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(e.target.value)}
                        placeholder="Enter Years"
                        required
                        className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barNumber" className="text-gray-700 dark:text-zinc-300 text-sm">Bar Number</Label>
                      <div className="relative">
                        <Input
                          id="barNumber"
                          type="text"
                          value={barNumber}
                          onChange={(e) => setBarNumber(e.target.value)}
                          placeholder="Enter Bar Registration No"
                          required
                          className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        />
                        {barNumberVerified && (
                          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        )}
                      </div>
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

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  disabled={isLoading || !email || !password || (!isLogin && (!name || !phoneVerified || !barNumberVerified))}
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

          {step === 'PROFILE_COMPLETE' && (
            <motion.div
              key="profile-complete"
              className="w-full max-w-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Complete Your Profile
                </h2>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mt-2">
                  We need a few more details to set up your lawyer account.
                </p>
              </div>

              <form onSubmit={handleProfileComplete} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gp-phone" className="text-gray-700 dark:text-zinc-300 text-sm">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="gp-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter Phone Number"
                      required
                      className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    />
                    {phoneVerified && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gp-barCouncilState" className="text-gray-700 dark:text-zinc-300 text-sm">Bar Council State</Label>
                  <Select value={barCouncilState} onValueChange={setBarCouncilState}>
                    <SelectTrigger className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DELHI">Delhi</SelectItem>
                      <SelectItem value="MAHARASHTRA">Maharashtra</SelectItem>
                      <SelectItem value="KARNATAKA">Karnataka</SelectItem>
                      <SelectItem value="TAMIL_NADU">Tamil Nadu</SelectItem>
                      <SelectItem value="KERALA">Kerala</SelectItem>
                      <SelectItem value="WEST_BENGAL">West Bengal</SelectItem>
                      <SelectItem value="GUJARAT">Gujarat</SelectItem>
                      <SelectItem value="RAJASTHAN">Rajasthan</SelectItem>
                      <SelectItem value="ANDHRA_PRADESH">Andhra Pradesh</SelectItem>
                      <SelectItem value="TELANGANA">Telangana</SelectItem>
                      <SelectItem value="UTTAR_PRADESH">Uttar Pradesh</SelectItem>
                      <SelectItem value="BIHAR">Bihar</SelectItem>
                      <SelectItem value="PUNJAB_HARYANA">Punjab &amp; Haryana</SelectItem>
                      <SelectItem value="MADHYA_PRADESH">Madhya Pradesh</SelectItem>
                      <SelectItem value="ODISHA">Odisha</SelectItem>
                      <SelectItem value="ASSAM">Assam</SelectItem>
                      <SelectItem value="GOA">Goa</SelectItem>
                      <SelectItem value="HIMACHAL">Himachal Pradesh</SelectItem>
                      <SelectItem value="SUPREME_COURT">Supreme Court</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gp-practiceAreas" className="text-gray-700 dark:text-zinc-300 text-sm">Practice Areas</Label>
                  <Input
                    id="gp-practiceAreas"
                    type="text"
                    value={practiceAreas.join(', ')}
                    onChange={(e) => setPracticeAreas(e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g. Criminal Law, Civil Law"
                    required
                    className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gp-yearsOfExperience" className="text-gray-700 dark:text-zinc-300 text-sm">Years of Experience</Label>
                  <Input
                    id="gp-yearsOfExperience"
                    type="number"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="Enter Years"
                    required
                    className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gp-barNumber" className="text-gray-700 dark:text-zinc-300 text-sm">Bar Number</Label>
                  <div className="relative">
                    <Input
                      id="gp-barNumber"
                      type="text"
                      value={barNumber}
                      onChange={(e) => setBarNumber(e.target.value)}
                      placeholder="Enter Bar Registration No"
                      required
                      className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    />
                    {barNumberVerified && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  disabled={!phoneVerified || !barNumberVerified}
                >
                  Continue to Verification
                </Button>
              </form>
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