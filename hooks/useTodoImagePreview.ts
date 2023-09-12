import getUrl from '@/lib/getUrl';
import { useEffect, useState } from 'react';

export default function useTodoImagePreview(todo: Todo) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (todo.image) {
      const fetchImage = async () => {
        const url = await getUrl(todo.image!);
        if (url) setImageUrl(url.toString());
      };

      fetchImage();
    }
  }, [todo]);

  return { imageUrl };
}
