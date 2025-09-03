import crypto from 'crypto';

// Flutterwave Integration
export class FlutterwavePayment {
  private secretKey: string;
  private publicKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.flutterwave.com/v3' 
      : 'https://api.flutterwave.com/v3'; // Use sandbox for testing
  }

  async createVirtualAccount(data: {
    email: string;
    amount: number;
    transactionId: string;
    customerName?: string;
  }) {
    const payload = {
      email: data.email,
      is_permanent: false,
      bvn: "12345678901", // In production, collect from user
      tx_ref: data.transactionId,
      amount: data.amount,
      frequency: "1",
      duration: "10", // 10 minutes
      narration: `Crypto purchase - ${data.transactionId}`,
    };

    const response = await fetch(`${this.baseUrl}/virtual-account-numbers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      return {
        accountNumber: result.data.account_number,
        bankName: result.data.bank_name,
        accountName: result.data.account_name,
        reference: result.data.order_ref,
      };
    }

    throw new Error(result.message || 'Failed to create virtual account');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async verifyTransaction(transactionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    return await response.json();
  }
}

// Paystack Integration
export class PaystackPayment {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.paystack.co'
      : 'https://api.paystack.co'; // Use test keys for development
  }

  async createDedicatedAccount(data: {
    email: string;
    customerCode?: string;
    preferredBank?: string;
  }) {
    const payload = {
      customer: data.customerCode,
      preferred_bank: data.preferredBank || 'test-bank',
    };

    const response = await fetch(`${this.baseUrl}/dedicated_account`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.status) {
      return {
        accountNumber: result.data.account_number,
        bankName: result.data.bank.name,
        accountName: result.data.account_name,
        reference: result.data.id,
      };
    }

    throw new Error(result.message || 'Failed to create dedicated account');
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async verifyTransaction(reference: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    return await response.json();
  }
}

export const paymentProvider = process.env.PAYMENT_PROVIDER === 'paystack' 
  ? new PaystackPayment() 
  : new FlutterwavePayment();