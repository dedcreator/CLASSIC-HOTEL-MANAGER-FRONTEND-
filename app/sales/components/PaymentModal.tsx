// frontend/app/sales/components/PaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CreditCardIcon, 
  CheckCircleIcon, 
  LockClosedIcon, 
  BuildingOfficeIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useInitializePayment, useVerifyPayment } from '@/lib/api/hooks/usePayments';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  total: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  saleId?: string;
  bookingId?: string;
  checkinId?: string;
  paymentType?: 'sale' | 'booking' | 'checkin';
  onClose: () => void;
  onComplete: (data: any) => void;
  isSubmitting: boolean;
  onGuestInfoChange?: (data: { name: string; email: string; phone: string }) => void;
}

type PaymentChannel = 'card' | 'bank_transfer';

export default function PaymentModal({ 
  total, 
  guestName = '',
  guestEmail = '',
  guestPhone = '',
  saleId,
  bookingId,
  checkinId,
  paymentType = 'sale',
  onClose, 
  onComplete, 
  isSubmitting,
  onGuestInfoChange
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('card');
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [localGuestName, setLocalGuestName] = useState(guestName);
  const [localGuestEmail, setLocalGuestEmail] = useState(guestEmail);
  const [localGuestPhone, setLocalGuestPhone] = useState(guestPhone);

  const initializePayment = useInitializePayment();
  const verifyPayment = useVerifyPayment();

  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

  // Load Korapay SDK
  useEffect(() => {
    if (!(window as any).Korapay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.korapay.com/js/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Update parent when guest info changes
  const handleGuestInfoChange = (field: string, value: string) => {
    const updates = {
      name: field === 'name' ? value : localGuestName,
      email: field === 'email' ? value : localGuestEmail,
      phone: field === 'phone' ? value : localGuestPhone,
    };
    
    if (field === 'name') setLocalGuestName(value);
    if (field === 'email') setLocalGuestEmail(value);
    if (field === 'phone') setLocalGuestPhone(value);
    
    if (onGuestInfoChange) {
      onGuestInfoChange(updates);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Prepare payment payload - all guest info is optional
      const payload: any = {
        payment_type: paymentType,
        amount: safeTotal,
        callback_url: `${window.location.origin}/payment/verify`,
        metadata: {
          payment_type: paymentType,
          source: 'pos',
          channel: selectedChannel,
        },
        description: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment`,
      };

      // Only add guest info if provided
      if (localGuestName?.trim()) {
        payload.customer_name = localGuestName.trim();
        payload.metadata.guest_name = localGuestName.trim();
      }
      if (localGuestEmail?.trim()) {
        payload.customer_email = localGuestEmail.trim();
      }
      if (localGuestPhone?.trim()) {
        payload.customer_phone = localGuestPhone.trim();
      }

      // Add the appropriate ID based on payment type
      if (paymentType === 'sale' && saleId) {
        payload.sale_id = saleId;
      } else if (paymentType === 'booking' && bookingId) {
        payload.booking_id = bookingId;
      } else if (paymentType === 'checkin' && checkinId) {
        payload.checkin_id = checkinId;
      }

      // For POS sales without a saleId yet, create the sale first
      if (paymentType === 'sale' && !saleId) {
        // Sale will be created after payment
        payload.metadata = {
          ...payload.metadata,
          total_amount: safeTotal,
          guest_name: localGuestName || 'Walk-in Guest',
        };
      }

      console.log('Payment payload:', payload);

      // Initialize payment with backend
      const result = await initializePayment.mutateAsync(payload);

      console.log('Payment result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Payment initialization failed');
      }

      setPaymentReference(result.reference);
      setPaymentLink(result.payment_link);

      // For bank transfers, show bank details
      if (selectedChannel === 'bank_transfer') {
        const bankData = result.data?.bank_transfer || {
          bank_name: 'Korapay Virtual Account',
          account_number: result.reference.substring(0, 10),
          account_name: `${localGuestName || 'Guest'} - ${result.reference}`,
          amount: safeTotal,
        };
        setBankDetails(bankData);
        setPaymentStatus('idle');
        setIsProcessing(false);
        toast.info('Bank transfer details generated');
        return;
      }

      // Initialize Korapay checkout for card payments
      const korapay = (window as any).Korapay;

      if (!korapay) {
        throw new Error('Korapay SDK not loaded. Please refresh and try again.');
      }

      const customer = {
        name: localGuestName || 'Walk-in Guest',
        email: localGuestEmail || 'guest@korapay.com',
      };

      // Create checkout instance
      const checkout = korapay.initialize({
        key: process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY,
        transactionReference: result.reference,
        amount: safeTotal,
        currency: 'NGN',
        customer: customer,
        onClose: () => {
          setIsProcessing(false);
          setPaymentStatus('idle');
          toast.info('Payment cancelled');
        },
        onSuccess: async (response: any) => {
          setPaymentStatus('completed');
          
          try {
            const verifyResult = await verifyPayment.mutateAsync(result.reference);

            if (verifyResult.success && verifyResult.verified) {
              onComplete({
                paymentMethod: 'card',
                transactionReference: result.reference,
                amountPaid: safeTotal,
                guestName: localGuestName || 'Walk-in Guest',
                guestEmail: localGuestEmail,
                guestPhone: localGuestPhone,
                paymentData: verifyResult.payment,
                korapayResponse: response,
                channel: 'card',
              });
              toast.success('Payment completed successfully!');
              setPaymentStatus('completed');
            } else {
              setPaymentStatus('failed');
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Verification error:', error);
            setPaymentStatus('failed');
            toast.error('Failed to verify payment. Please contact support.');
          }
          
          setIsProcessing(false);
        },
        onError: (error: any) => {
          setIsProcessing(false);
          setPaymentStatus('failed');
          console.error('Korapay error:', error);
          toast.error(error.message || 'Payment failed. Please try again.');
        },
      });

      checkout.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      setPaymentStatus('failed');
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Payment failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle bank transfer confirmation
  const handleBankTransferConfirm = async () => {
    if (!paymentReference) return;
    
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const verifyResult = await verifyPayment.mutateAsync(paymentReference);

      if (verifyResult.success && verifyResult.verified) {
        onComplete({
          paymentMethod: 'bank_transfer',
          transactionReference: paymentReference,
          amountPaid: safeTotal,
          guestName: localGuestName || 'Walk-in Guest',
          guestEmail: localGuestEmail,
          guestPhone: localGuestPhone,
          paymentData: verifyResult.payment,
          channel: 'bank_transfer',
        });
        toast.success('Payment confirmed successfully!');
        setPaymentStatus('completed');
        setIsProcessing(false);
      } else {
        setPaymentStatus('failed');
        setIsProcessing(false);
        toast.error('Payment verification failed. Please try again or contact support.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setPaymentStatus('failed');
      setIsProcessing(false);
      toast.error('Failed to verify payment. Please contact support.');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[#DDD5C4] flex justify-between items-center bg-[#16302B] text-[#F7F1E4] rounded-t-xl">
          <div>
            <h2 className="font-display text-lg font-medium">Complete Payment</h2>
            <p className="font-body text-sm text-[#B9C4B9]">Secure cashless payment</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-[#1D3B34] rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Optional Guest Information */}
          <div className="space-y-3">
            <p className="font-body text-sm text-[#8A8377]">Guest Information <span className="text-xs">(Optional)</span></p>
            
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8A8377]" />
              <input
                type="text"
                placeholder="Guest name (optional)"
                value={localGuestName}
                onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                className="font-body w-full pl-9 pr-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
              />
            </div>
            
            <div className="relative">
              <input
                type="email"
                placeholder="Email (optional - for receipt)"
                value={localGuestEmail}
                onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
              />
            </div>
            
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={localGuestPhone}
                onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                className="font-body w-full px-3 py-2 border border-[#DDD5C4] rounded-lg bg-[#FAF6EF] text-[#2A2622] outline-none transition-colors focus:border-[#C9A468] focus:ring-1 focus:ring-[#C9A468] placeholder:text-[#8A8377]"
              />
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-[#F7F1E4] rounded-lg p-4 border border-[#DDD5C4]">
            <p className="font-body text-sm text-[#8A8377] mb-1">Total Amount</p>
            <p className="font-display text-3xl font-medium text-[#16302B]">
              ₦{safeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Payment Status */}
          {paymentStatus === 'processing' && (
            <div className="bg-[#DBEAFE] rounded-lg p-4 border border-[#93C5FD]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="font-body text-sm font-medium text-[#1E40AF]">Processing Payment</p>
                  <p className="font-body text-xs text-[#1E40AF]">Please wait while we process your payment...</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="bg-[#E8F5E9] rounded-lg p-4 border border-[#A5D6A7]">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-8 w-8 text-[#2E7D32]" />
                <div>
                  <p className="font-body text-sm font-medium text-[#2E7D32]">Payment Successful</p>
                  <p className="font-body text-xs text-[#2E7D32]">Your payment has been confirmed</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-[#FCE4EC] rounded-lg p-4 border border-[#EF9A9A]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#C62828] rounded-full flex items-center justify-center text-white font-bold">!</div>
                <div>
                  <p className="font-body text-sm font-medium text-[#C62828]">Payment Failed</p>
                  <p className="font-body text-xs text-[#C62828]">Please try again or contact support</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {selectedChannel === 'bank_transfer' && bankDetails && paymentStatus !== 'completed' && (
            <div className="bg-[#FFF3E0] rounded-lg p-4 border border-[#FFCC80]">
              <h4 className="font-body font-medium text-[#E65100] flex items-center gap-2 mb-3">
                <BuildingOfficeIcon className="h-5 w-5" />
                Bank Transfer Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-sm text-[#5B564B]">Bank</span>
                  <span className="font-body text-sm font-medium text-[#2A2622]">{bankDetails.bank_name || 'Korapay'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-[#5B564B]">Account Number</span>
                  <span className="font-body text-sm font-medium text-[#2A2622] font-mono">{bankDetails.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-[#5B564B]">Account Name</span>
                  <span className="font-body text-sm font-medium text-[#2A2622]">{bankDetails.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-[#5B564B]">Amount</span>
                  <span className="font-body text-sm font-medium text-[#E65100]">₦{safeTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-[#5B564B]">Reference</span>
                  <span className="font-body text-sm font-medium text-[#2A2622] font-mono">{paymentReference}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#FFCC80]">
                <p className="font-body text-xs text-[#E65100]">
                  <span className="font-medium">Note:</span> Payment will be confirmed automatically once received.
                  You can click "Check Status" after making the transfer.
                </p>
                <button
                  onClick={handleBankTransferConfirm}
                  disabled={isProcessing}
                  className="mt-3 w-full font-body py-2 px-4 text-sm font-medium text-[#F7F1E4] bg-[#E65100] rounded-lg hover:bg-[#BF360C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  {isProcessing ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </div>
          )}

          {/* Payment Channel Selection */}
          {paymentStatus === 'idle' && (
            <div>
              <p className="font-body text-sm font-medium text-[#5B564B] mb-3">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedChannel('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === 'card'
                      ? 'border-[#C9A468] bg-[#F7F1E4]'
                      : 'border-[#DDD5C4] hover:border-[#B9C4B9]'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 mx-auto text-[#16302B]" />
                  <p className="font-body text-sm font-medium text-[#2A2622] mt-1">Card</p>
                  <p className="font-body text-xs text-[#8A8377]">Visa, Mastercard, Verve</p>
                </button>
                <button
                  onClick={() => setSelectedChannel('bank_transfer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedChannel === 'bank_transfer'
                      ? 'border-[#C9A468] bg-[#F7F1E4]'
                      : 'border-[#DDD5C4] hover:border-[#B9C4B9]'
                  }`}
                >
                  <BuildingOfficeIcon className="h-6 w-6 mx-auto text-[#16302B]" />
                  <p className="font-body text-sm font-medium text-[#2A2622] mt-1">Bank Transfer</p>
                  <p className="font-body text-xs text-[#8A8377]">Direct bank transfer</p>
                </button>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-[#DBEAFE] rounded-lg p-3 border border-[#93C5FD]">
            <div className="flex items-center gap-2">
              <LockClosedIcon className="h-5 w-5 text-[#1E40AF]" />
              <div>
                <p className="font-body text-sm font-medium text-[#1E40AF]">Secure Payment</p>
                <p className="font-body text-xs text-[#1E40AF]">Your payment is secured by Korapay</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {paymentStatus === 'idle' && (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isProcessing}
                className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#16302B] bg-[#F7F1E4] border border-[#DDD5C4] rounded-lg hover:bg-[#DDD5C4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePayment}
                disabled={isSubmitting || isProcessing}
                className="flex-1 font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] border border-transparent rounded-lg hover:bg-[#1D3B34] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A468] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting || isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#F7F1E4] border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedChannel === 'card' ? (
                      <>
                        <CreditCardIcon className="h-5 w-5" />
                        Pay with Card
                      </>
                    ) : (
                      <>
                        <BuildingOfficeIcon className="h-5 w-5" />
                        Generate Transfer Details
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <button
              type="button"
              onClick={onClose}
              className="w-full font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#16302B] rounded-lg hover:bg-[#1D3B34] transition-colors"
            >
              Close
            </button>
          )}

          {paymentStatus === 'failed' && (
            <button
              type="button"
              onClick={() => {
                setPaymentStatus('idle');
                setBankDetails(null);
              }}
              className="w-full font-body px-4 py-2.5 text-sm font-medium text-[#F7F1E4] bg-[#C62828] rounded-lg hover:bg-[#B71C1C] transition-colors"
            >
              Try Again
            </button>
          )}

          <p className="font-body text-center text-xs text-[#8A8377]">
            By continuing, you agree to our payment terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}