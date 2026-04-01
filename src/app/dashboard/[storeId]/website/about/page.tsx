'use client';

import React from 'react';
import LegalPageEditor from '@/components/dashboard/LegalPageEditor';
import { Info } from 'lucide-react';

export default function AboutPage() {
  return <LegalPageEditor type="about" title="About Page" icon={<Info className="h-6 w-6 text-blue-600" />} />;
}
