'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/dashboard/BlogForm';

export default function EditBlogPage() {
  const params = useParams();
  const postId = params?.postId as string;
  
  return <BlogForm isEdit={true} postId={postId} />;
}
