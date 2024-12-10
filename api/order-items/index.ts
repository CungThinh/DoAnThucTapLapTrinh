import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { InsertTables } from "@/app/types";

export const useAddOrderItems = () => {
    return useMutation({
      async mutationFn(items: InsertTables<'order_items'>[]) {
        const { data: newOrderItems, error } = await supabase
          .from('order_items')
          .insert(items)
          .select()
        if (error) {
          throw new Error(error.message);
        }
        return newOrderItems;
      },
    });
  };
  