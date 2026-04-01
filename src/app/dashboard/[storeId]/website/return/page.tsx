'use client';

import React from 'react';
import LegalPageEditor from '@/components/dashboard/LegalPageEditor';
import { RotateCcw } from 'lucide-react';

export default function ReturnPage() {
  return <LegalPageEditor type="return" title="Return Policy" icon={<RotateCcw className="h-6 w-6 text-orange-600" />} />;
}
