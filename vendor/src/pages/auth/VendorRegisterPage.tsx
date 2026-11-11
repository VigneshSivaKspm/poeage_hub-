import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Store, AlertCircle } from 'lucide-react';

export const VendorRegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { registerVendorAccount } = useVendorAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await registerVendorAccount(email, password, name);
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Failed to create seller account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Create Seller Account</CardTitle>
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mt-1">
              Step 1 of 2: Account Setup
            </p>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Start selling to thousands of customers across India on POEAGE HUB.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Primary Contact Name"
              type="text"
              required
              placeholder="Rajesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Input
              label="Business Email"
              type="email"
              required
              autoComplete="username"
              placeholder="rajesh@enterprises.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 shadow-lg active:bg-emerald-700 mt-2"
              isLoading={loading}
            >
              Continue to Business KYC
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already registered as a seller?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
