'use client';

import React from 'react';
import LegalPageEditor from '@/components/dashboard/LegalPageEditor';
import { DollarSign } from 'lucide-react';

export default function RefundPage() {
  return <LegalPageEditor type="refund" title="Refund Policy" icon={<DollarSign className="h-6 w-6 text-red-600" />} />;
}
