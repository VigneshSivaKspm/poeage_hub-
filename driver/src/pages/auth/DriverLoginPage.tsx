import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDriverAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Truck, AlertCircle } from 'lucide-react';

export const DriverLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginDriver } = useDriverAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await loginDriver(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
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

        <CardContent className="space-y-6 pt-2">
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
