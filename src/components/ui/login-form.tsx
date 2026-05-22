'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import TocDialog from '@/components/docs/terms/toc-dialog';
import PrivacyDialog from '@/components/docs/terms/privacy-dialog';
import Aurora from '@/components/ui/Aurora';
import { Logo } from '@/components/ui/logo';
import { Eye, EyeOff, Loader2, Scale, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000").replace(/\/api$/, '');

interface LoginFormProps {
  onAuthenticated?: (user: { name: string; email: string; avatar?: string }) => void;
  mode?: 'login' | 'register';
}

export default function LoginForm({ onAuthenticated, mode = 'login' }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(mode === 'login');
  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  const toggleAuthMode = () => {
    const target = isLogin ? '/auth/citizen?action=register' : '/auth/citizen?action=login';
    router.push(target);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Validation Error", { description: "Please fill in all required fields." });
      return;
    }

    if (!isLogin && !name) {
      toast.error("Validation Error", { description: "Please enter your name." });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, name };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${isLogin ? 'Login' : 'Registration'} failed`);
      }

      if (data.success && data.data) {
        localStorage.setItem('authToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        const userData = {
          name: data.data.user.name,
          email: data.data.user.email,
          userType: 'citizen'
        };

        localStorage.setItem('user', JSON.stringify(userData));

        toast.success("Success!", { description: isLogin ? "Logged in successfully." : "Account created successfully." });

        if (onAuthenticated) {
          onAuthenticated(userData);
        }
      }
    } catch (error) {
      toast.error("Authentication Failed", { description: error instanceof Error ? error.message : "An error occurred. Please try again." });
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

      const response = await fetch(`${API_BASE_URL}/api/auth/google/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Google sign-in failed');
      }

      if (data.success && data.data) {
        localStorage.setItem('authToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        const userData = {
          name: data.data.user.name,
          email: data.data.user.email,
          userType: 'citizen'
        };
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Success!', { description: 'Logged in successfully with Google.' });

        if (onAuthenticated) {
          onAuthenticated(userData);
        }
      }
    } catch (error) {
      // User closed the popup or other cancellation
      if (error instanceof Error && error.message.includes('popup-closed-by-user')) {
        // Silently ignore — user cancelled
      } else {
        toast.error('Google Sign-In Failed', { description: error instanceof Error ? error.message : 'An error occurred. Please try again.' });
      }
    } finally {
      await firebaseAuth.signOut();
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row gap-4 p-4 bg-background">
      {/* Left — Aurora branding panel */}
      <div className="hidden md:flex md:w-1/2 relative bg-[#03020d] rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Aurora 
            colorStops={["#03020d", "#3b4ff8", "#8a2be2"]}
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
              <p className="text-blue-200/70 text-base max-w-xs leading-relaxed">
                AI-powered legal intelligence for professionals
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-3 w-full max-w-[260px]"
            >
              <Button
                variant="default"
                onClick={() => router.push('/auth/lawyer?action=login')}
                className="w-full bg-gradient-to-r from-[#3b4ff8] to-[#8a2be2] text-white/90 font-medium h-11 gap-2 shadow-lg cursor-pointer hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Scale className="h-4 w-4" />
                Lawyer Authentication
              </Button>
              <Button
                variant="default"
                onClick={() => router.push('/auth/firm?action=login')}
                className="w-full bg-gradient-to-r from-[#3b4ff8] to-[#8a2be2] text-white/90 font-medium h-11 gap-2 shadow-lg cursor-pointer hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Building2 className="h-4 w-4" />
                Firm Authentication
              </Button>
            </motion.div>
          </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 min-h-[calc(100vh-2rem)]">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
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
              {isLogin ? 'Sign in' : 'Sign up'}
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
                : 'Create your account to get started.'}
            </motion.p>
          </div>

          {/* Google button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
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
          </motion.div>

          {/* Divider */}
          <motion.div
            className="relative my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-gray-400 dark:text-zinc-500">or</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {!isLogin && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Label htmlFor="name" className="text-gray-700 dark:text-zinc-300 text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Your Name"
                  required={!isLogin}
                  className="h-11 bg-gray-50 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </motion.div>
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
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
              disabled={isLoading || !email || !password || (!isLogin && !name)}
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
          </motion.form>

          {/* Toggle auth mode */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
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
          </motion.div>

          {/* Mobile auth type buttons */}
          <motion.div
            className="flex md:hidden flex-col gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-gray-400 dark:text-zinc-500">Professional Access</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/lawyer?action=login')}
              className="w-full text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 gap-2 h-10 text-sm"
            >
              <Scale className="h-4 w-4" />
              Lawyer Authentication
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/auth/firm?action=login')}
              className="w-full text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/50 gap-2 h-10 text-sm"
            >
              <Building2 className="h-4 w-4" />
              Firm Authentication
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-gray-400 dark:text-zinc-600 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            &copy; LegalAI &middot;{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyDialog(true)}
              className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              Privacy
            </button>
            {' '}&middot;{' '}
            <button
              type="button"
              onClick={() => setShowTermsDialog(true)}
              className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
            >
              Terms
            </button>
          </motion.p>
        </motion.div>
      </div>

      <TocDialog
        open={showTermsDialog}
        onOpenChange={setShowTermsDialog}
      />
      <PrivacyDialog
        open={showPrivacyDialog}
        onOpenChange={setShowPrivacyDialog}
      />
    </div>
  );
}