'use client';

import React, { useEffect } from 'react';
import { Store, Product } from '@/types';
import DefaultTemplate from './templates/DefaultTemplate';
import FashionHubTemplate from './templates/FashionHubTemplate';
import VisualTemplate from './templates/VisualTemplate';

import { motion, AnimatePresence } from 'framer-motion';

interface TemplateRendererProps {
  templateId: string;
  store: Store;
  products: Product[];
  categories: any[];
  brands: any[];
  branches: any[];
  content: Record<string, string>;
  activePageId?: 'home' | 'checkout' | 'search' | 'contact' | 'product_detail';
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = (props) => {
  const { templateId, store } = props;

  // Sync Global Branding
  useEffect(() => {
    const primary = store.appearance?.primaryColor || '#3b82f6';
    document.documentElement.style.setProperty('--store-primary', primary);
    document.documentElement.style.setProperty('--store-primary-hover', `${primary}e6`); // 90% opacity
  }, [store.appearance?.primaryColor]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={templateId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "circOut" }}
      >
        {(() => {
          switch (templateId) {
            case 'aura':
               return <FashionHubTemplate {...props} />;
            case 'swift':
            case 'visual':
               return <VisualTemplate {...props} />;
            case 'nordic':
            case 'apex':
            case 'default':
            default:
              return <DefaultTemplate {...props} />;
          }
        })()}
      </motion.div>
    </AnimatePresence>
  );
};
