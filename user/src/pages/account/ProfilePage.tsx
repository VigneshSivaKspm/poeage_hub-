import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@poeage/ui';
import { updateDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import { User, Phone, Mail, Shield, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateDocument(COLLECTION.USERS, user.uid, {
        displayName,
        phone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left summary card */}
        <Card className="h-fit">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-700 font-bold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
              {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">{displayName || 'Customer'}</h3>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-center gap-2">
              <Badge variant="success">Active Account</Badge>
              <Badge variant="info">Customer</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Right edit form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your contact name and mobile phone number.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                  required
                />

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed directly for security reasons."
                />

                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />

                <Button type="submit" isLoading={saving}>
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Security & Roles
              </CardTitle>
              <CardDescription>Your authorization claims in the POEAGE HUB ecosystem.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Assigned Roles</span>
                  <div className="flex gap-1.5">
                    {(profile?.roles || ['customer']).map((r) => (
                      <Badge key={r} variant="default">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Firebase User ID</span>
                  <span className="font-mono text-xs text-gray-500">{user?.uid}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Email Verified</span>
                  <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
                    {user?.emailVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
