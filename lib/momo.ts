import { Alert } from 'react-native';
import { MoMoPayment } from 'react-native-momo-payment';

// Replace these with your actual MoMo merchant credentials
const MOMO_MERCHANT_CODE = 'YOUR_MERCHANT_CODE';
const MOMO_MERCHANT_NAME = 'Your Pizza Shop';
const MOMO_MERCHANT_NAME_LABEL = 'Pizza Shop';

export const initMoMoPayment = async (amount: number): Promise<{ status: 'success' | 'failed' | 'cancelled' }> => {
  try {
    const paymentInfo = {
      merchantcode: MOMO_MERCHANT_CODE,
      merchantname: MOMO_MERCHANT_NAME,
      merchantnamelabel: MOMO_MERCHANT_NAME_LABEL,
      appScheme: 'momopartner', // Your app's URL scheme for MoMo to return to
      amount: amount,
      orderId: `ORDER_${Date.now()}`,
      orderLabel: 'Pizza Order',
      description: 'Payment for pizza order',
    };

    const result = await MoMoPayment.requestPayment(paymentInfo);

    if (result.status === 0) {
      // Payment successful
      return { status: 'success' };
    } else if (result.status === 5) {
      // Payment cancelled by user
      return { status: 'cancelled' };
    } else {
      // Payment failed
      return { status: 'failed' };
    }
  } catch (error) {
    console.error('MoMo payment error:', error);
    Alert.alert('Error', 'Failed to initialize MoMo payment. Please try again.');
    return { status: 'failed' };
  }
};

