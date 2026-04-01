'use client';

import React from 'react';
import LegalPageEditor from '@/components/dashboard/LegalPageEditor';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return <LegalPageEditor type="terms" title="Terms & Conditions" icon={<FileText className="h-6 w-6 text-blue-600" />} />;
}
