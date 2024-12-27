// supabase/functions/process-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Kiểm tra authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(
            JSON.stringify({ error: 'Missing authorization header' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            }
        );
    }

    try {
        // Rest of your code...
        const { items, user_id, delivery_address } = await req.json()

        console.log('Received items:', items);
        console.log('User ID:', user_id);
        console.log('Delivery address:', delivery_address);

        // Initialize Stripe
        // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
        //     apiVersion: '2023-10-16'
        // });

        // Initialize Stripe
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        console.log('Stripe key exists:', !!stripeKey);
        if (!stripeKey) {
            throw new Error('Stripe key not found');
        }

        const stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16'
        });

        // Kiểm tra và chuyển đổi giá trị
        const amount = items.reduce((acc, item) => {
            console.log('Processing item:', item);
            // Kiểm tra nếu price nằm trong product
            const price = item.product?.price || item.price;
            const quantity = item.quantity;

            console.log(`Price: ${price}, Quantity: ${quantity}`);
            return acc + (parseFloat(price) * parseInt(quantity));
        }, 0);

        console.log('Calculated amount:', amount);

        const total = amount + 2.99;
        console.log('Total with delivery fee:', total);

        // Đảm bảo amount là số nguyên (cents)
        const amountInCents = Math.round(total * 100);
        console.log('Amount in cents:', amountInCents);

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            payment_method_types: ['card', 'cashapp'], // Thêm 'cashapp' để hỗ trợ Cash App Pay
        });


        // Save order and order items to database
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        )

        // Tạo order trước
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert([
                {
                    user_id,
                    items,
                    total: total,
                    payment_intent_id: paymentIntent.id,
                    status: 'New',
                    delivery_address,
                }
            ])
            .select()
            .single()

        if (orderError) throw orderError

        // Tạo order_items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product?.id || item.id,
            size: item.size,
            quantity: item.quantity
        }));

        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems);
        
            if (itemsError) throw itemsError

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                orderId: order.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Function error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})