import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useInsertOrderSubcription = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const ordersSubscription = supabase
            .channel('custom-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
            )
            .subscribe();
            
        return () => {
            ordersSubscription.unsubscribe();
        }
    }, []);
}

export const useAdminOrdersSubscription = () => {
    const queryClient = useQueryClient();
  
    useEffect(() => {
        const channel = supabase
            .channel('admin-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                async (payload) => {
                    console.log('Order change detected:', payload);
                    // Force refetch data instead of just invalidate
                    await queryClient.fetchQuery({ queryKey: ['orders'] });
                }
            )
            .subscribe((status) => {
                // console.log('Subscription status:', status);
            });
  
        return () => {
            channel.unsubscribe();
        };
    }, []);
};