import fs from 'fs';
import path from 'path';

const baseDir = 'src/app/dashboard/[storeId]';
const routes = [
  'products/categories',
  'products/brands',
  'products/features',
  'products/featured',
  'products/reviews',
  'customers/contact',
  'customers/past',
  'promotions/offers',
  'promotions/codes',
  'affiliates',
  'delivery/prices',
  'delivery/installation',
  'delivery/partners',
  'delivery/custom',
  'dropshipping/products',
  'dropshipping/settlement',
  'notifications',
  'website/footer',
  'website/branches',
  'website/blog',
  'website/faq',
  'website/privacy',
  'website/terms',
  'website/return',
  'website/refund',
  'settings/info',
  'settings/domain',
  'settings/managers',
  'settings/appearance',
  'settings/payments',
  'settings/templates',
  'plugins',
  'reports'
];

routes.forEach(route => {
  const dirPath = path.join(baseDir, route);
  fs.mkdirSync(dirPath, { recursive: true });

  let routeName = route.split('/').pop().replace(/-/g, ' ');
  const title = routeName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  const content = `import React from 'react';
import { PackageX } from 'lucide-react';

export default function ${title}Page() {
  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-8">
      <div className="max-w-[1400px] mx-auto bg-white rounded-2xl border p-12 text-center shadow-sm">
        <PackageX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">${routeName.charAt(0).toUpperCase() + routeName.slice(1)}</h1>
        <p className="text-gray-500">This module is currently being built out. Check back soon for full functionality.</p>
      </div>
    </div>
  );
}
`;

  const filePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
});
