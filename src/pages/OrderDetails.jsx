import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../supabase';
import { showSubtleLoader, hideSubtleLoader, showBlockingLoader, hideBlockingLoader, addToast } from '../store/uiSlice';
import { updateOrderStatusLocally } from '../store/ordersSlice';
import { ArrowLeft, ExternalLink, Package, Truck, CreditCard, User, MapPin } from 'lucide-react';
import dayjs from 'dayjs';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  
  // Form state
  const [status, setStatus] = useState('');
  const [trackingLink, setTrackingLink] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');

  const fetchOrder = async () => {
    dispatch(showSubtleLoader('Loading order details...'));
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles:user_id ( username )
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;
      
      setOrder(orderData);
      setStatus(orderData.status);
      setTrackingLink(orderData.tracking_link || '');
      setTrackingId(orderData.tracking_id || '');
      setTrackingNotes(orderData.tracking_notes || '');

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData);

    } catch (error) {
      console.error('Failed to fetch order:', error);
      dispatch(addToast({ type: 'error', message: 'Failed to load order details.' }));
    } finally {
      dispatch(hideSubtleLoader());
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, dispatch]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  };

  const handleUpdateDelivery = async (e) => {
    e.preventDefault();

    if (trackingLink && !isValidUrl(trackingLink)) {
      dispatch(addToast({ type: 'error', message: 'Tracking link must be a valid URL.' }));
      return;
    }

    dispatch(showBlockingLoader('Updating order...'));
    try {
      const { error } = await supabase.rpc('update_order_status', {
        p_order_id: id,
        p_status: status,
        p_tracking_link: trackingLink || null,
        p_tracking_id: trackingId || null,
        p_tracking_notes: trackingNotes || null
      });

      if (error) throw error;

      dispatch(addToast({ type: 'success', message: 'Order updated successfully.' }));
      dispatch(updateOrderStatusLocally({
        id, status, tracking_link: trackingLink, tracking_id: trackingId, tracking_notes: trackingNotes
      }));
      
      // Refresh local view
      await fetchOrder();
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message || 'Failed to update order.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  if (!order) return null;

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <button 
        onClick={() => navigate('/orders')}
        style={{ background: 'none', border: 'none', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif-display)', color: 'var(--color-text-dark)', margin: '0 0 5px 0' }}>Order #{order.order_code}</h2>
          <div style={{ color: '#6c757d', fontSize: '14px' }}>Placed on {dayjs(order.created_at).format('MMMM D, YYYY at h:mm A')}</div>
        </div>
        <div>
          <span style={{ 
            backgroundColor: order.status === 'pending_payment' ? '#fff3cd' : '#d1e7dd', 
            color: order.status === 'pending_payment' ? '#856404' : '#0f5132', 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
        
        {/* Left Column: Items and Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Order Items Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="#6c757d" /> Order Items
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orderItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #f8f9fa', paddingBottom: '15px' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#f8f9fa', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.variant_snapshot?.product_media?.find(m => m.media_type === 'image') ? (
                      <img src={item.variant_snapshot.product_media.find(m => m.media_type === 'image').media_url} alt={item.title_at_purchase} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={24} color="#dee2e6" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#212529', marginBottom: '4px' }}>{item.title_at_purchase}</div>
                    <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '4px' }}>
                      Quantity: {item.quantity} × ₦{parseFloat(item.price_at_purchase).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </div>
                    {item.variant_snapshot?.attributes && Object.keys(item.variant_snapshot.attributes).length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {Object.entries(item.variant_snapshot.attributes).map(([k, v]) => (
                          <span key={k} style={{ fontSize: '11px', background: '#f8f9fa', border: '1px solid #dee2e6', padding: '2px 6px', borderRadius: '4px', color: '#495057' }}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: '#212529' }}>
                    ₦{(item.quantity * item.price_at_purchase).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', fontSize: '14px' }}>
                <span>Subtotal</span>
                <span>₦{parseFloat(order.subtotal_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d', fontSize: '14px' }}>
                <span>Delivery Fee</span>
                <span>₦{parseFloat(order.shipping_fee).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#212529', fontSize: '16px', marginTop: '5px', paddingTop: '10px', borderTop: '1px dashed #dee2e6' }}>
                <span>Total Amount</span>
                <span>₦{parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Customer & Delivery Mgmt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Customer Info Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#6c757d" /> Customer Info
            </h3>
            <div style={{ fontSize: '14px', color: '#495057', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Name:</strong> {order.contact_info?.fullName || order.user_profiles?.username || 'Guest'}</div>
              <div><strong>Email:</strong> {order.contact_info?.email}</div>
              <div><strong>Phone:</strong> {order.contact_info?.phone}</div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#6c757d" /> Shipping Address
            </h3>
            <div style={{ fontSize: '14px', color: '#495057', lineHeight: '1.5' }}>
              <div>{order.shipping_address?.street}</div>
              {order.shipping_address?.apartment && <div>{order.shipping_address.apartment}</div>}
              <div>{order.shipping_address?.city}, {order.shipping_address?.state}</div>
              {order.shipping_address?.postalCode && <div>{order.shipping_address.postalCode}</div>}
              <div>{order.shipping_address?.country}</div>
            </div>
          </div>

          {/* Payment Info Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#6c757d" /> Payment Info
            </h3>
            <div style={{ fontSize: '14px', color: '#495057', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Method:</strong> <span style={{ textTransform: 'capitalize' }}>{order.payment_method || 'N/A'}</span></div>
              <div><strong>Reference:</strong> <span style={{ fontFamily: 'monospace' }}>{order.payment_reference || 'N/A'}</span></div>
            </div>
          </div>

          {/* Delivery & Status Management Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 15px 0', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} color="#6c757d" /> Delivery Management
            </h3>
            
            {order.status === 'pending_payment' ? (
              <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
                Delivery details cannot be managed while order is pending payment.
              </div>
            ) : (
              <form onSubmit={handleUpdateDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '5px' }}>Order Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#fff' }}
                  >
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '5px' }}>Tracking Provider / ID</label>
                  <input 
                    type="text" 
                    value={trackingId} 
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. DHL-12345678"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '5px' }}>Tracking Link</label>
                  <input 
                    type="url" 
                    value={trackingLink} 
                    onChange={(e) => setTrackingLink(e.target.value)}
                    placeholder="https://tracker.dhl.com/..."
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
                  />
                  {trackingLink && !isValidUrl(trackingLink) && (
                    <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px' }}>Please enter a valid URL.</div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#495057', marginBottom: '5px' }}>Tracking Notes</label>
                  <textarea 
                    value={trackingNotes} 
                    onChange={(e) => setTrackingNotes(e.target.value)}
                    placeholder="Additional delivery instructions or notes..."
                    rows="3"
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', resize: 'vertical' }}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  style={{ backgroundColor: 'var(--color-primary-dark)', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', marginTop: '5px', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary-dark)'}
                >
                  Save Delivery Details
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
