// MoMo Payment Service
import { momoConfig, generateOrderId, generateMoMoSignature } from './config';

export interface MoMoPaymentRequest {
  amount: number;
  orderInfo: string;
  returnUrl: string;
  notifyUrl: string;
  extraData?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  orderInfo: string;
  deeplink: string;
  qrCode: string;
}

export class MoMoService {
  private config = momoConfig;

  /**
   * Create a payment request with MoMo
   */
  async createPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
    const orderId = generateOrderId();
    const requestId = generateOrderId();
    const orderInfo = request.orderInfo || 'Payment for DineConnect order';
    
    const params = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId,
      amount: request.amount.toString(),
      userId: 'dineconnect_user',
      orderId,
      orderInfo,
      returnUrl: request.returnUrl,
      notifyUrl: request.notifyUrl,
      extraData: request.extraData || '',
      requestType: 'captureMoMoWallet',
      lang: 'vi',
    };

    // Generate signature
    const signature = generateMoMoSignature(params, this.config.secretKey);

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`MoMo API error: ${response.statusText}`);
      }

      const data: MoMoPaymentResponse = await response.json();
      
      if (data.resultCode !== 0) {
        throw new Error(`MoMo payment failed: ${data.message}`);
      }

      return data;
    } catch (error) {
      console.error('MoMo payment error:', error);
      throw error;
    }
  }

  /**
   * Check transaction status
   */
  async checkTransactionStatus(orderId: string): Promise<any> {
    const params = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId: generateOrderId(),
      orderId,
      lang: 'vi',
    };

    const signature = generateMoMoSignature(params, this.config.secretKey);

    try {
      const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`MoMo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MoMo transaction check error:', error);
      throw error;
    }
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(
    orderId: string,
    amount: number,
    transId: string
  ): Promise<any> {
    const params = {
      partnerCode: this.config.partnerCode,
      accessKey: this.config.accessKey,
      requestId: generateOrderId(),
      orderId,
      amount: amount.toString(),
      transId,
      lang: 'vi',
    };

    const signature = generateMoMoSignature(params, this.config.secretKey);

    try {
      const response = await fetch('https://test-payment.momo.vn/v2/gateway/api/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`MoMo API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MoMo refund error:', error);
      throw error;
    }
  }
}

export const momoService = new MoMoService();
