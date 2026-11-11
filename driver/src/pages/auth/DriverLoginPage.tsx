import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDriverAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Truck, AlertCircle, Zap, KeyRound } from 'lucide-react';

export const DriverLoginPage: React.FC = () => {
  const [email, setEmail] = useState('driver@poeagehub.com');
  const [password, setPassword] = useState('driver123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginDriver } = useDriverAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (targetEmail: string, targetPass: string) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await loginDriver(targetEmail, targetPass);
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
    setEmail('driver@poeagehub.com');
    setPassword('driver123');
    handleLogin('driver@poeagehub.com', 'driver123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">POEAGE HUB</CardTitle>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mt-1">
              Delivery Partner Portal
            </p>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Accept dispatches, navigate routes, and confirm deliveries.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-1">
          {/* Demo Helper Box */}
          <div className="p-3.5 bg-amber-950/50 border border-amber-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Temporary Demo Credentials
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                Pre-configured
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono space-y-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <p>Email: <span className="text-amber-400 font-bold">driver@poeagehub.com</span></p>
              <p>Password: <span className="text-amber-400 font-bold">driver123</span> (or any password)</p>
            </div>
            <Button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950" />
              ⚡ Instant 1-Click Demo Driver Login
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
              label="Driver Email"
              type="email"
              required
              autoComplete="username"
              placeholder="driver@poeagehub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500"
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500"
            />

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 shadow-lg active:bg-amber-600 mt-2"
              isLoading={loading}
            >
              Sign In & Go Online
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Want to drive with POEAGE HUB?{' '}
            <Link to="/register" className="font-semibold text-amber-400 hover:text-amber-300">
              Register vehicle & profile
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
