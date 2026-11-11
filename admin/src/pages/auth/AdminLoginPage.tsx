import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Shield, AlertCircle, Zap, CheckCircle2, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@k7fitness.app');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleLogin = async (targetEmail: string, targetPass: string) => {
    setErrorMsg(null);
    setLoading(true);

    try {
      await loginAdmin(targetEmail, targetPass);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleQuickDemoLogin = () => {
    setEmail('demo@k7fitness.app');
    setPassword('admin123');
    handleLogin('demo@k7fitness.app', 'admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">POEAGE HUB</CardTitle>
            <p className="text-xs uppercase tracking-widest text-blue-400 font-semibold mt-1">
              Admin Operations Center
            </p>
          </div>
          <CardDescription className="text-slate-400 text-xs">
            Restricted entry. Authorization token and administrative clearance required.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-1">
          {/* Demo Credentials Helper Box */}
          <div className="p-3.5 bg-blue-950/50 border border-blue-800/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Temporary Demo Credentials
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                Pre-configured
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono space-y-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <p>Email: <span className="text-blue-400 font-bold">demo@k7fitness.app</span> (or admin@poeagehub.com)</p>
              <p>Password: <span className="text-blue-400 font-bold">admin123</span> (or any password)</p>
            </div>
            <Button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 shadow-md flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              ⚡ Instant 1-Click Demo Admin Login
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
              label="Admin Identity (Email)"
              type="email"
              required
              autoComplete="username"
              placeholder="demo@k7fitness.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
            />

            <Input
              label="Security Passkey (Password)"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500"
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 shadow-lg active:bg-blue-700 mt-2"
              isLoading={loading}
            >
              Authenticate Admin Session
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Session is actively monitored and audited. Unauthorized access attempts are logged with client IP.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
