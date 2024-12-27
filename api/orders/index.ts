import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthProvider";
import { InsertTables } from "@/app/types";
import { UpdateTables } from "@/app/types";
import { Tables } from "@/app/types";

export const useAdminOrderList = ({ archived = false }) => {
  // Thay đổi cách lọc status
  const statuses = archived 
    ? ["Delivered"] // Archived chỉ lấy orders đã delivered
    : ["New", "Delivering", "Cooking", "Delevering"]; // Active lấy tất cả trạng thái khác

  return useQuery({
    queryKey: ["orders", archived],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!inner(*)
        `)
        .in("status", statuses)
        .order("created_at", { ascending: false }); // Sắp xếp theo thời gian tạo, mới nhất lên đầu

      if (error) {
        throw new Error(error.message);
      }
      // console.log('Fetched orders:', data);
      return data;
    },
    // Thêm options để tự động refresh
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 3000,
  });
};

export const useMyOrderList = () => {
  const { session } = useAuth();
  const id = session?.user.id;
  return useQuery({
    queryKey: ["orders", { userId: id }],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useOrderDetails = (id: number) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useAddOrders = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  return useMutation({
    async mutationFn(data: InsertTables<"orders">) {
      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return newOrder;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn({id, updatedField}: {id: number; updatedField: UpdateTables<'orders'>}) {
      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updatedField)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return updatedOrder;
    },
    async onSuccess(updatedOrder) {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["orders", updatedOrder.id],
      });
    },
  });
};

export const useInsertOrder = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    async mutationFn(data: InsertTables<'orders'>) {
      const { error, data: newProduct } = await supabase
        .from('orders')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newProduct;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ['orders']
      });
    },
  });
};