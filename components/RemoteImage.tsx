import { Image } from 'react-native';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type RemoteImageProps = {
  path?: string | null;
  fallback: string;
} & Omit<ComponentProps<typeof Image>, 'source'>;

const RemoteImage = ({ path, fallback, ...imageProps }: RemoteImageProps) => {
    const [image, setImage] = useState('');
  
    useEffect(() => {
      const loadImage = async () => {
        if (!path) {
          setImage(fallback);
          return;
        }
  
        // If it's an external URL
        if (path.startsWith('http')) {
          setImage(path);
          return;
        }
  
        // If it's a Supabase storage path
        try {
          const { data: urlData, error } = await supabase.storage
            .from('product-images')
            .createSignedUrl(path, 3600); // URL valid for 1 hour
  
          if (error) {
            console.log('Error getting signed URL:', error);
            setImage(fallback);
            return;
          }
  
          if (urlData?.signedUrl) {
            setImage(urlData.signedUrl);
          } else {
            setImage(fallback);
          }
        } catch (e) {
          console.log('Exception in loadImage:', e);
          setImage(fallback);
        }
      };
  
      loadImage();
    }, [path, fallback]);
  
    return <Image source={{ uri: image || fallback }} {...imageProps} />;
  };

export default RemoteImage;