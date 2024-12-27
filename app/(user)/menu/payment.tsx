// app/(user)/menu/payment.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/context/CartProvider';
import { useAuth } from '@/context/AuthProvider';
import { Colors } from '@/constants/Colors';
import Button from '@/components/Button';
import { STRIPE_API_URL } from '@/constants/StripeSettings';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const { items, total, clearCart } = useCart();
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Fetch default delivery address
            const { data: addressData, error: addressError } = await supabase
                .from('delivery_addresses')
                .select('*')
                .eq('user_id', session?.user.id)
                .eq('is_default', true)
                .single();

            if (addressError || !addressData) {
                throw new Error('No delivery address found');
            }

            // Format delivery address for request
            const deliveryAddress = {
                full_name: addressData.full_name,
                phone: addressData.phone,
                street: addressData.street,
                district: addressData.district,
                city: addressData.city
            };

            // Create payment intent
            const paymentResponse = await fetch(STRIPE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    items,
                    user_id: session?.user.id,
                    delivery_address: deliveryAddress,
                }),
            });

            // Log response
            const data = await paymentResponse.json();
            console.log('Response:', data);

            if (!data.clientSecret) {
                throw new Error('No client secret received');
            }

            // Initialize payment sheet
            const { error: initError } = await initPaymentSheet({
                paymentIntentClientSecret: data.clientSecret,
                merchantDisplayName: 'Pizza App',
                returnURL: 'pizzaapp://payment', // Thay đổi này
                defaultBillingDetails: {
                    name: session?.user?.email,
                }
            });
            if (initError) {
                throw new Error(initError.message);
            }

            // Present payment sheet
            // Update order status to 'New' after successful payment
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'New' })
                .eq('id', data.orderId);
            const { error: paymentError } = await presentPaymentSheet();

            if (updateError) throw updateError;

            if (paymentError) {
                throw new Error(paymentError.message);
            }

            // Payment successful
            clearCart();
            Alert.alert('Success', 'Your order has been placed!');
            await queryClient.invalidateQueries(['orders']);
            router.replace(`/orders/${data.orderId}`);

        } catch (error) {
            console.error('Payment Error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Order Summary</Text>

                <View style={styles.summaryContainer}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.value}>${total.toFixed(2)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Delivery Fee</Text>
                        <Text style={styles.value}>$2.99</Text>
                    </View>

                    <View style={[styles.row, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${(total + 2.99).toFixed(2)}</Text>
                    </View>
                </View>

                <Button
                    onPress={handlePayment}
                    text={loading ? "Processing..." : "Pay Now"}
                    style={styles.payButton}
                    disabled={loading}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    summaryContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.tint,
    },
    payButton: {
        borderRadius: 12,
    },
});