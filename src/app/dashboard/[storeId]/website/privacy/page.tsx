'use client';

import React from 'react';
import LegalPageEditor from '@/components/dashboard/LegalPageEditor';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return <LegalPageEditor type="privacy" title="Privacy Policy" icon={<Shield className="h-6 w-6 text-emerald-600" />} />;
}
