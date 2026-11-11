import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Truck, AlertCircle } from 'lucide-react';
import type { VehicleType } from '@poeage/types';

export const DriverOnboardingPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { submitDriverOnboarding, signOutDriver } = useDriverAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await submitDriverOnboarding({
        displayName,
        phone,
        vehicleType,
        vehicleNumber,
        licenseNumber,
      });
      navigate('/status', { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as { message?: string }).message || 'Failed to submit driver details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-white shadow-2xl">
        <CardHeader className="space-y-2 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-white">Vehicle & Verification</CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Step 2: Enter logistics fleet information
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOutDriver} className="text-slate-400 hover:text-white">
              Sign Out
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Driver Full Name"
              required
              placeholder="Vikram Singh"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
            />

            <Input
              label="Active Mobile Number"
              required
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border bg-slate-950 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="motorcycle">Motorcycle / Bike</option>
                <option value="scooter">Scooter</option>
                <option value="bicycle">Bicycle</option>
                <option value="van">Delivery Van</option>
                <option value="car">Car</option>
              </select>
            </div>

            <Input
              label="Vehicle Registration Plate Number"
              required
              placeholder="DL 01 AB 1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 font-mono uppercase"
            />

            <Input
              label="Driving License Number"
              required
              placeholder="DL-1420110012345"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
              className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 font-mono uppercase"
            />

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 shadow-lg mt-2"
              isLoading={loading}
            >
              Submit for Admin Verification
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
