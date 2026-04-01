import { v2 as cloudinary } from 'cloudinary';

// ✧ Multi-Account Cloudinary Manager (50GB+ Free Storage)
// This system automatically rotates between storage accounts to maximize free capacity.

const accounts = [
  {
    name: 'Account A',
    config: {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    }
  },
  {
    name: 'Account B',
    config: {
      cloud_name: process.env.CLOUDINARY_B_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_B_API_KEY,
      api_secret: process.env.CLOUDINARY_B_API_SECRET,
    }
  },
  {
    name: 'Account C',
    config: {
      cloud_name: process.env.CLOUDINARY_C_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_C_API_KEY,
      api_secret: process.env.CLOUDINARY_C_API_SECRET,
    }
  },
  {
    name: 'Account D',
    config: {
      cloud_name: process.env.CLOUDINARY_D_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_D_API_KEY,
      api_secret: process.env.CLOUDINARY_D_API_SECRET,
    }
  },
  {
    name: 'Account E',
    config: {
      cloud_name: process.env.CLOUDINARY_E_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_E_API_KEY,
      api_secret: process.env.CLOUDINARY_E_API_SECRET,
    }
  },
  {
    name: 'Account F',
    config: {
      cloud_name: process.env.CLOUDINARY_F_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_F_API_KEY,
      api_secret: process.env.CLOUDINARY_F_API_SECRET,
    }
  },
  {
    name: 'Account G',
    config: {
      cloud_name: process.env.CLOUDINARY_G_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_G_API_KEY,
      api_secret: process.env.CLOUDINARY_G_API_SECRET,
    }
  },
  {
    name: 'Account H',
    config: {
      cloud_name: process.env.CLOUDINARY_H_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_H_API_KEY,
      api_secret: process.env.CLOUDINARY_H_API_SECRET,
    }
  }
];

export const cloudinaryStorage = {
  /**
   * Powerful Multi-Account Upload: Attempts each account in order.
   * Total Free Space: 50GB
   */
  uploadImage: async (fileUri: string, folder: string = 'products') => {
    let lastError = null;

    for (const account of accounts) {
      if (!account.config.cloud_name || !account.config.api_key) continue;

      try {
        // Set the active account configuration
        cloudinary.config(account.config);

        const result = await cloudinary.uploader.upload(fileUri, {
          folder: `shop-builder/${folder}`,
          resource_type: 'auto',
          // Optional: Add metadata to track which account holds the image
          context: `account=${account.name}`
        });

        return {
          url: result.secure_url,
          publicId: result.public_id,
          accountUsed: account.name
        };
      } catch (error: any) {
        lastError = error;
        console.warn(`[Storage Alert] ${account.name} failed. Attempting next account... Error:`, error.message);
        // Continue loop to try next account 🏎️💨
      }
    }

    throw new Error(`All Cloud Storage accounts are full or unavailable. Reason: ${lastError?.message}`);
  },

  /**
   * Delete image: Note, this requires the publicId and know which account holds it.
   * For now, it will attempt deletion on the Main account.
   */
  deleteImage: async (publicId: string) => {
    try {
      cloudinary.config(accounts[0].config); // Start with primary
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      throw new Error('Failed to remove image from cloud storage');
    }
  }
};
