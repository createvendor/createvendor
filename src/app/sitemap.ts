import { MetadataRoute } from 'next';
import { db } from '@/firebase/config';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';

// Maximum entries allowed in a single sitemap by search engines is 50,000
// For 1000+ vendors and 100 products each, we should eventually use Next.js 
// generateSitemaps() feature to split these into multiple files.
// For now, this is a scalable high-performance automated sitemap.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://createvendor.shop';

  try {
    // 1. Static Routes (High Priority)
    const staticRoutes = [
      '',
      '/signup',
      '/login',
      '/onboarding',
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    }));

    // 2. Fetch Active Stores (Dynamic)
    const storesSnap = await getDocs(query(collection(db, 'stores'), limit(500)));
    const storeRoutes = storesSnap.docs.map((doc) => ({
      url: `${baseUrl}/store/${doc.id}`,
      lastModified: doc.data().updatedAt || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // 3. Fetch Recent Products (Dynamic - Top 10,000 for initial indexing)
    // In a multi-vendor environment, we fetch all products across all stores.
    // We limit this to ensure fast server-side generation.
    const productsSnap = await getDocs(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(10000))
    );
    
    const productRoutes = productsSnap.docs.map((doc) => {
      const data = doc.data();
      // Ensure we have storeId and productId for correct URL structure
      return {
        url: `${baseUrl}/store/${data.storeId}/products/${doc.id}`,
        lastModified: data.updatedAt || new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      };
    }).filter(route => !route.url.includes('undefined')); // Clean undefined routes

    return [...staticRoutes, ...storeRoutes, ...productRoutes];

  } catch (error) {
    console.error('Sitemap generation failed:', error);
    // Return at least static routes if anything fails
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
      },
    ];
  }
}
