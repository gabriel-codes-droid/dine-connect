import { useState } from 'react';
import { CreditCard, Smartphone, QrCode, ExternalLink, Loader2 } from 'lucide-react';
import { momoService, type MoMoPaymentRequest } from '../../services/momo/momoService';

interface MoMoPaymentProps {
  amount: number;
  orderInfo: string;
  orderId: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export default function MoMoPayment({
  amount,
  orderInfo,
  orderId,
  onCancel,
  onError,
}: MoMoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'app' | 'qr'>('app');

  const handlePayment = async () => {
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/payment/success`;
      const notifyUrl = `${window.location.origin}/api/payment/notify`;

      const request: MoMoPaymentRequest = {
        amount,
        orderInfo,
        returnUrl,
        notifyUrl,
        extraData: JSON.stringify({ orderId }),
      };

      const response = await momoService.createPayment(request);
      setPaymentData(response);

      // Redirect to MoMo payment page if using app payment
      if (paymentMethod === 'app' && response.payUrl) {
        window.location.href = response.payUrl;
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Payment
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Total Amount: <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">
            {amount.toLocaleString()}đ
          </span>
        </p>
      </div>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setPaymentMethod('app')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'app'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
          }`}
        >
          <Smartphone className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <p className="font-medium text-gray-900 dark:text-white">MoMo App</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Pay via MoMo app</p>
        </button>

        <button
          onClick={() => setPaymentMethod('qr')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'qr'
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
          }`}
        >
          <QrCode className="mx-auto mb-2 text-indigo-600 dark:text-indigo-400" size={32} />
          <p className="font-medium text-gray-900 dark:text-white">QR Code</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Scan to pay</p>
        </button>
      </div>

      {/* QR Code Display */}
      {paymentMethod === 'qr' && paymentData?.qrCode && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center">
          <QrCode className="mx-auto mb-4 text-gray-400" size={48} />
          <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 inline-block">
            <img
              src={`data:image/png;base64,${paymentData.qrCode}`}
              alt="MoMo QR Code"
              className="w-48 h-48"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Scan with MoMo app to complete payment
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <CreditCard size={16} />
          <span>Order ID: {orderId}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
          <Smartphone size={16} />
          <span>Secured by MoMo Payment Gateway</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <Smartphone size={20} />
              Pay with MoMo
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Payment Link (if app payment) */}
      {paymentMethod === 'app' && paymentData?.payUrl && (
        <div className="text-center">
          <a
            href={paymentData.payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ExternalLink size={16} />
            Open MoMo Payment Page
          </a>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Your payment information is secure and encrypted.</p>
        <p>MoMo payment gateway is PCI DSS compliant.</p>
      </div>
    </div>
  );
}
