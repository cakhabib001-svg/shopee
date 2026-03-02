"use server";

import { put } from "@vercel/blob";

export async function uploadImageToVercel(base64Image: string) {
  // Ekstrak data murni dari base64
  const base64Data = base64Image.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Upload buffer ke Vercel Blob
  const blob = await put(`products/img-${Date.now()}.jpg`, buffer, { 
    access: 'public',
    contentType: 'image/jpeg'
  });
  
  return blob.url; // Mengembalikan URL gambar asli
}