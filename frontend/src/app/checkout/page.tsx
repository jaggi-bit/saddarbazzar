'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import api from '@/lib/api';
import { ShieldCheck, Truck, CreditCard, Loader2, MapPin } from 'lucide-react';
import Image from 'next/image';
import styles from './page.module.css';

const PROVINCES = [
  'Sindh',
  'Punjab',
  'Balochistan',
  'Khyber Pakhtunkhwa',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
  'Islamabad Capital Territory'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shippingName: user?.fullName || '',
    shippingPhone: '',
    shippingEmail: user?.email || '',
    shippingProvince: '',
    shippingCity: '',
    shippingDistrict: '',
    shippingAddress: '',
    shippingAddressCategory: 'Home',
    shippingLandmark: '',
    shippingPinCode: '',
    orderNote: '',
    paymentMethod: 'COD', // Default to COD
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  if (!cart || cart.items.length === 0) {
    return null; // Will redirect
  }

  const shippingAmount = 200; // Flat rate
  const totalAmount = cart.subtotal + shippingAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding best effort using OpenStreetMap
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              setFormData((prev) => ({ ...prev, shippingAddress: data.display_name }));
            } else {
              setFormData((prev) => ({ ...prev, shippingAddress: `${latitude}, ${longitude}` }));
            }
          } catch (e) {
            setFormData((prev) => ({ ...prev, shippingAddress: `${latitude}, ${longitude}` }));
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error(error);
          alert('Could not fetch location. Please enable location services in your browser.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.shippingProvince) {
      setError("Please select a province.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/checkout', formData);
      const { orderId, paymentUrl, status } = response.data;

      // Clear the local cart
      clearCart();

      // If the backend returns a payment URL, redirect to the gateway
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        // COD or no redirect required — go to success page
        router.push(`/checkout/success?order_id=${orderId}`);
      }
    } catch (err: any) {
      const message = err.response?.data?.message 
        || err.response?.data?.error 
        || 'Failed to place order. Please try again.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.checkoutLayout}>
        
        {/* Left Column: Forms */}
        <div className={styles.formSection}>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {/* Shipping Details */}
            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Shipping Information</h2>
              
              <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingName">Full Name</label>
                  <input
                    type="text"
                    id="shippingName"
                    name="shippingName"
                    value={formData.shippingName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingEmail">Email Address</label>
                  <input
                    type="email"
                    id="shippingEmail"
                    name="shippingEmail"
                    value={formData.shippingEmail}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="shippingPhone"
                    name="shippingPhone"
                    value={formData.shippingPhone}
                    onChange={handleInputChange}
                    placeholder="0300-1234567"
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingAddressCategory">Address Category</label>
                  <select
                    id="shippingAddressCategory"
                    name="shippingAddressCategory"
                    value={formData.shippingAddressCategory}
                    onChange={handleInputChange}
                    required
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label htmlFor="shippingAddress">Full Address</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="House No, Street, Area"
                    required
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer'
                    }}
                    title="Get Current Location automatically"
                  >
                    {isLocating ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingProvince">Province</label>
                  <select
                    id="shippingProvince"
                    name="shippingProvince"
                    value={formData.shippingProvince}
                    onChange={handleInputChange}
                    required
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                  >
                    <option value="" disabled>Select province...</option>
                    {PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingCity">City</label>
                  <input
                    type="text"
                    id="shippingCity"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleInputChange}
                    placeholder="Karachi, Lahore, etc."
                    required
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingDistrict">District / Area</label>
                  <input
                    type="text"
                    id="shippingDistrict"
                    name="shippingDistrict"
                    value={formData.shippingDistrict}
                    onChange={handleInputChange}
                    placeholder="Defence, Clifton, Gulshan"
                    required
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <label htmlFor="shippingLandmark">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    id="shippingLandmark"
                    name="shippingLandmark"
                    value={formData.shippingLandmark}
                    onChange={handleInputChange}
                    placeholder="Opposite hospital, Near park"
                  />
                </div>
              </div>

              <div className={styles.inputWrapper}>
                <label htmlFor="orderNote">Order Note (Optional)</label>
                <textarea
                  id="orderNote"
                  name="orderNote"
                  value={formData.orderNote}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery..."
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className={styles.formGroup}>
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.paymentMethods}>
                
                <label className={`${styles.paymentOption} ${formData.paymentMethod === 'ONLINE' ? styles.paymentSelected : ''}`}>
                  <div className={styles.paymentRadio}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="ONLINE" 
                      checked={formData.paymentMethod === 'ONLINE'}
                      onChange={() => handlePaymentSelect('ONLINE')}
                    />
                  </div>
                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentName}>Online Payment (Debit / Credit)</span>
                    <span className={styles.paymentDesc}>Securely pay with Visa, Mastercard, JazzCash, or EasyPaisa.</span>
                  </div>
                  <CreditCard className={styles.paymentIcon} />
                </label>

                <label className={`${styles.paymentOption} ${formData.paymentMethod === 'COD' ? styles.paymentSelected : ''}`}>
                  <div className={styles.paymentRadio}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={formData.paymentMethod === 'COD'}
                      onChange={() => handlePaymentSelect('COD')}
                    />
                  </div>
                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentName}>Cash on Delivery (COD)</span>
                    <span className={styles.paymentDesc}>Pay with cash when your order arrives.</span>
                  </div>
                  <Truck className={styles.paymentIcon} />
                </label>
                
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn} 
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> Processing...</>
              ) : formData.paymentMethod === 'ONLINE' ? (
                'Pay Securely Online'
              ) : (
                'Place Order (COD)'
              )}
            </button>
            <p className={styles.secureText}>
              <ShieldCheck size={16} /> All transactions are highly encrypted and completely secure.
            </p>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.summaryItems}>
              {cart.items.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemImageWrapper}>
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt={item.product.name} fill className={styles.itemImage} sizes="64px"/>
                    ) : (
                      <div className={styles.imagePlaceholder} />
                    )}
                    <span className={styles.itemBadge}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product.name}</span>
                    <span className={styles.itemCategory}>{item.product.categoryName}</span>
                  </div>
                  <span className={styles.itemPrice}>Rs. {item.itemTotal.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryTotals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Rs. {shippingAmount.toLocaleString()}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

