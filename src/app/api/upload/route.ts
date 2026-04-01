import { NextResponse } from 'next/server';
import { cloudinaryStorage } from '@/lib/cloudinary';

// ✧ High-Performance Media API: Powered by Cloudinary
// This ensures all product images are stored safely in 25GB of cloud space.

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const storeId = formData.get('storeId') as string;

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No valid file received.' }, { status: 400 });
        }

        // Convert File object to Buffer for Cloudinary processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Use data URI format to send the buffer to Cloudinary SDK
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload directly to Cloudinary using the professional helper
        // Organizes images by store subfolders for better management
        const result = await cloudinaryStorage.uploadImage(base64Image, storeId || 'general');

        // Return the secure cloud-hosted URL produced by Cloudinary
        return NextResponse.json({ url: result.url });

    } catch (error: any) {
        console.error('Cloudinary Image Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Cloud storage upload failed' }, { status: 500 });
    }
}
