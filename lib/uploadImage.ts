import { ID, storage } from '@/appwrite';

export default async function uploadImage(file: File) {
  if (!file) return;

  const fileUploaded = await storage.createFile(process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID!, ID.unique(), file);

  return fileUploaded;
}
