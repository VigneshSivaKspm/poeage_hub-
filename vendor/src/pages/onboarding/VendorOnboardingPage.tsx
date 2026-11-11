import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Building2, AlertCircle } from 'lucide-react';

export const VendorOnboardingPage: React.FC = () => {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { submitVendorApplication, signOutVendor } = useVendorAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await submitVendorApplication({
        storeName,
        phone,
        email,
        gstNumber,
        panNumber,
        description,
        address: {
          line1,
          city,
          state,
          postalCode,
          country: 'IN',
        },
      });
      navigate('/status', { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="space-y-2 border-b border-slate-800 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Merchant Business Profile</CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Step 2: Submit store details and legal business information for review.
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOutVendor} className="text-slate-400 hover:text-white">
              Sign Out
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store Display Name"
                required
                placeholder="e.g. Apex Tech Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              />

              <Input
                label="Contact Business Email"
                required
                type="email"
                placeholder="contact@apextech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              />

              <Input
                label="Business Phone Number"
                required
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              />

              <Input
                label="GSTIN (Optional)"
                placeholder="29AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 font-mono"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-slate-300">Pickup & Warehouse Address</h4>

              <Input
                label="Street Address / Building"
                required
                placeholder="Shop #12, Commercial Hub, MG Road"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                />

                <Input
                  label="State"
                  required
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                />

                <Input
                  label="PIN Code"
                  required
                  placeholder="560001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 shadow-lg"
              isLoading={loading}
            >
              Submit Application for Administrator Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
