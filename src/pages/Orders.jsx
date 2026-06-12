import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrdersAsync, setPage } from '../store/ordersSlice';
import { showSubtleLoader, hideSubtleLoader } from '../store/uiSlice';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import dayjs from 'dayjs';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending_payment': return { bg: '#fff3cd', color: '#856404' };
    case 'paid': return { bg: '#d4edda', color: '#155724' };
    case 'processing': return { bg: '#cce5ff', color: '#004085' };
    case 'shipped': return { bg: '#e2e3e5', color: '#383d41' };
    case 'delivered': return { bg: '#d1e7dd', color: '#0f5132' };
    case 'cancelled': return { bg: '#f8d7da', color: '#721c24' };
    default: return { bg: '#e9ecef', color: '#495057' };
  }
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalCount, currentPage, ordersPerPage } = useSelector((state) => state.orders);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      dispatch(showSubtleLoader('Loading orders...'));
      setIsRefreshing(true);
      try {
        await dispatch(fetchOrdersAsync({ page: currentPage, limit: ordersPerPage })).unwrap();
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        dispatch(hideSubtleLoader());
        setIsRefreshing(false);
      }
    };
    fetchOrders();
  }, [dispatch, currentPage, ordersPerPage]);

  const totalPages = Math.ceil(totalCount / ordersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      dispatch(setPage(newPage));
    }
  };

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif-display)', color: 'var(--color-text-dark)', margin: 0 }}>Orders</h2>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '15px 20px', fontWeight: 600, color: '#495057', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: '#6c757d' }}>
                    {isRefreshing ? 'Loading orders...' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                items.map((order) => {
                  const statusColors = getStatusColor(order.status);
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#212529', fontFamily: 'monospace', fontWeight: '600' }}>
                        {order.order_code}
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#495057' }}>
                        {dayjs(order.created_at).format('MMM D, YYYY h:mm A')}
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#212529' }}>
                        {order.contact_info?.fullName || order.user_profiles?.username || 'Guest'}
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>{order.contact_info?.email}</div>
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '14px', color: '#212529', fontWeight: 500 }}>
                        ₦{parseFloat(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          backgroundColor: statusColors.bg, 
                          color: statusColors.color, 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/orders/${order.id}`)}
                          style={{ background: 'none', border: '1px solid #dee2e6', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#495057', fontSize: '13px', transition: 'all 0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.borderColor = '#ccc'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#dee2e6'; }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #dee2e6', backgroundColor: '#f8f9fa' }}>
            <span style={{ fontSize: '13px', color: '#6c757d' }}>
              Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, totalCount)} of {totalCount} orders
            </span>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '6px 10px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#adb5bd' : '#495057', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{ 
                    padding: '6px 12px', 
                    background: currentPage === page ? 'var(--color-primary-dark)' : '#fff', 
                    color: currentPage === page ? '#fff' : '#495057',
                    border: `1px solid ${currentPage === page ? 'var(--color-primary-dark)' : '#dee2e6'}`, 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: currentPage === page ? 600 : 400
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '6px 10px', background: '#fff', border: '1px solid #dee2e6', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#adb5bd' : '#495057', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .table-row-hover:hover {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default Orders;
