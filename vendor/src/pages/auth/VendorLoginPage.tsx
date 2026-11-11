import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVendorAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Store, AlertCircle, Zap, KeyRound } from 'lucide-react';

export const VendorLoginPage: React.FC = () => {
  const [email, setEmail] = useState('contact@k7fitness.app');
  const [password, setPassword] = useState('vendor123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginVendor } = useVendorAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (targetEmail: string, targetPass: string) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await loginVendor(targetEmail, targetPass);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleQuickDemoLogin = () => {
    setEmail('contact@k7fitness.app');
    setPassword('vendor123');
    handleLogin('contact@k7fitness.app', 'vendor123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">POEAGE HUB</CardTitle>
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mt-1">
              Seller & Merchant Portal
            </p>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Manage your store inventory, customer orders, and payouts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-1">
          {/* Demo Helper Box */}
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                Temporary Demo Credentials
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                Pre-configured
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono space-y-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <p>Email: <span className="text-emerald-400 font-bold">contact@k7fitness.app</span> (or vendor@poeagehub.com)</p>
              <p>Password: <span className="text-emerald-400 font-bold">vendor123</span> (or any password)</p>
            </div>
            <Button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              ⚡ Instant 1-Click Demo Seller Login
            </Button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Seller Email"
              type="email"
              required
              autoComplete="username"
              placeholder="vendor@poeagehub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
            />

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 shadow-lg active:bg-emerald-700 mt-2"
              isLoading={loading}
            >
              Sign In to Seller Dashboard
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-1">
            Want to sell on POEAGE HUB?{' '}
            <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Register your business
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
