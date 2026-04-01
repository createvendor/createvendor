import React from 'react';
import { PackageX } from 'lucide-react';

export default function DropshippingPage() {
  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl border p-12 text-center shadow-sm">
        <PackageX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dropshipping</h1>
        <p className="text-gray-500">This module is currently being built out. Check back soon for full functionality.</p>
      </div>
    </div>
  );
}
