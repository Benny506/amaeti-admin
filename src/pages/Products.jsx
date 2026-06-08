import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminHeader } from '../store/uiSlice';
import { fetchProducts, fetchCategories } from '../store/productsSlice';
import ProductsTable from '../components/products/ProductsTable';
import CategoriesModal from '../components/products/CategoriesModal';
import ProductEditorModal from '../components/products/ProductEditorModal';
import { Plus, FolderCog } from 'lucide-react';

const Products = () => {
  const dispatch = useDispatch();
  const { items, categories, hasMore, page } = useSelector((state) => state.products);
  
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(setAdminHeader({ 
      title: 'Product Catalog', 
      description: 'Manage your entire inventory, collections, and variants.' 
    }));

    if (items.length === 0 && hasMore) {
      dispatch(fetchProducts({ page: 1 }));
    }
    
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, items.length, hasMore, categories.length]);

  const handleLoadMore = () => {
    if (hasMore) {
      dispatch(fetchProducts({ page: page + 1 }));
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => setShowCategoriesModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 25px', backgroundColor: 'transparent', 
            color: 'var(--color-text-dark)', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em'
          }}
        >
          <FolderCog size={16} />
          Manage Categories
        </button>

        <button 
          onClick={handleCreateProduct}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 25px', backgroundColor: 'var(--color-text-dark)', 
            color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
        >
          <Plus size={16} />
          Create Product
        </button>
      </div>

      {/* Table Sub-component */}
      <ProductsTable 
        products={items} 
        hasMore={hasMore} 
        onLoadMore={handleLoadMore} 
        onEdit={handleEditProduct}
      />

      <CategoriesModal 
        show={showCategoriesModal} 
        onHide={() => setShowCategoriesModal(false)} 
      />

      <ProductEditorModal 
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        initialProduct={selectedProduct}
        onManageCategories={() => setShowCategoriesModal(true)}
      />

    </div>
  );
};

export default Products;
