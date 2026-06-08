import React from 'react';
import { Edit2 } from 'lucide-react';

const ProductsTable = ({ products, hasMore, onLoadMore, onEdit }) => {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      
      {/* Responsive wrapper to prevent mobile shrinking */}
      <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -20px', padding: '0 20px' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Product</th>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Inventory</th>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Price Range</th>
              <th style={{ textAlign: 'left', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Date Added</th>
              <th style={{ textAlign: 'right', padding: '15px 10px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  No products found. Add your first product to see it here.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '20px 10px' }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-serif-display)', fontSize: '16px', color: 'var(--color-text-dark)' }}>{product.title}</p>
                    <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)' }}>SKU/Slug: {product.slug}</p>
                  </td>
                  <td style={{ padding: '20px 10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-dark)' }}>
                    {product.categories?.title || 'Uncategorized'}
                  </td>
                  <td style={{ padding: '20px 10px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      backgroundColor: product.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: product.is_active ? '#10b981' : '#ef4444',
                      fontFamily: 'var(--font-sans)', 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      fontWeight: 500
                    }}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 10px', fontFamily: 'var(--font-sans)' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-dark)' }}>
                      {product.product_variants?.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0) || 0} in stock
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      for {product.product_variants?.length || 0} variant(s)
                    </p>
                  </td>
                  <td style={{ padding: '20px 10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-dark)' }}>
                    {(() => {
                      if (!product.product_variants || product.product_variants.length === 0) return '—';
                      const prices = product.product_variants.map(v => parseFloat(v.price) || 0);
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      return min === max ? `₦${min.toFixed(2)}` : `₦${min.toFixed(2)} - ₦${max.toFixed(2)}`;
                    })()}
                  </td>
                  <td style={{ padding: '20px 10px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '20px 10px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onEdit && onEdit(product)}
                      style={{ 
                        background: 'none', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', 
                        color: 'var(--color-primary-dark)', padding: '8px', borderRadius: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Edit Product"
                    >
                      <Edit2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <button 
            onClick={onLoadMore}
            style={{ 
              padding: '10px 25px', 
              backgroundColor: 'transparent', 
              border: '1px solid var(--color-primary-dark)', 
              color: 'var(--color-primary-dark)', 
              borderRadius: '0', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-sans)', 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary-dark)'; }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
