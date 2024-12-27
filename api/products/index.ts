import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export const useFetchProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) { 
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useFetchProductById = (id: number) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useAddProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(data: any) {
      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          image: data.image,
          price: data.price,
        })
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return newProduct;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(data: any) {
      // Chỉ update image khi có image mới
      const updateData: any = {
        name: data.name,
        price: data.price,
      };

      // Nếu có image mới thì mới update
      if (data.image) {
        updateData.image = data.image;
      }

      const { data: updatedProduct, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedProduct;
    },
    async onSuccess(updatedProduct) {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["products", updatedProduct.id],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(product_id: number) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq('id', product_id)
      if (error) {
        throw new Error(error.message);
      }
    },
    async onSuccess(updatedProduct) {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export function useInsertProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertProductParams) {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          price: data.price,
          image: data.image,
          category: data.category, // Make sure this line exists
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newProduct;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
}

export type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
  category: string;
};

// Update the insert product mutation type
type InsertProductParams = Pick<Product, 'name' | 'price' | 'image' | 'category'>;