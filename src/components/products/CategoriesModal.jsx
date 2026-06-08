import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react';
import { supabase } from '../../supabase';
import { fetchCategories } from '../../store/productsSlice';
import { addToast, showBlockingLoader, hideBlockingLoader } from '../../store/uiSlice';
import { useConfirm } from '../ui/ConfirmProvider';
import InputRow from '../ui/InputRow';

const slugify = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const CategoriesModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.products);
  const { confirm } = useConfirm();

  const [view, setView] = useState('list'); // 'list' or 'form'
  const [formData, setFormData] = useState({ id: null, title: '', slug: '', description: '' });

  // Reset view when modal closes
  useEffect(() => {
    if (!show) {
      setTimeout(() => setView('list'), 300);
    }
  }, [show]);

  const openForm = (category = null) => {
    if (category) {
      setFormData({ id: category.id, title: category.title, slug: category.slug, description: category.description || '' });
    } else {
      setFormData({ id: null, title: '', slug: '', description: '' });
    }
    setView('form');
  };

  const closeForm = () => {
    setView('list');
    setFormData({ id: null, title: '', slug: '', description: '' });
  };

  const handleTitleChange = (val) => {
    // Auto-generate slug only if we are creating new, or if slug is empty
    if (!formData.id || !formData.slug) {
      setFormData(prev => ({ ...prev, title: val, slug: slugify(val) }));
    } else {
      setFormData(prev => ({ ...prev, title: val }));
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      dispatch(addToast({ type: 'warning', message: 'Title and Slug are required.' }));
      return;
    }

    try {
      dispatch(showBlockingLoader('Saving category...'));
      
      if (formData.id) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update({ title: formData.title, slug: formData.slug, description: formData.description })
          .eq('id', formData.id);
        
        if (error) throw error;
        dispatch(addToast({ type: 'success', message: 'Category updated successfully.' }));
      } else {
        // Insert
        const { error } = await supabase
          .from('categories')
          .insert([{ title: formData.title, slug: formData.slug, description: formData.description }]);
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('A category with this slug already exists.');
          }
          throw error;
        }
        dispatch(addToast({ type: 'success', message: 'Category created successfully.' }));
      }

      dispatch(fetchCategories());
      closeForm();
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message || 'Failed to save category.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  const handleDelete = async (category) => {
    const isConfirmed = await confirm({
      title: 'Delete Category',
      description: `Are you sure you want to delete "${category.title}"? This cannot be undone.`,
      confirmText: 'Delete Category',
      iconType: 'danger'
    });

    if (!isConfirmed) return;

    try {
      dispatch(showBlockingLoader('Checking constraints...'));

      // Strict DB check for linked products
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', category.id);

      if (countError) throw countError;

      if (count > 0) {
        dispatch(hideBlockingLoader());
        dispatch(addToast({ 
          type: 'error', 
          message: `Cannot delete: ${count} product(s) are currently assigned to this category.` 
        }));
        return; // Abort
      }

      dispatch(showBlockingLoader('Deleting category...'));
      
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (deleteError) throw deleteError;

      dispatch(addToast({ type: 'success', message: 'Category deleted successfully.' }));
      dispatch(fetchCategories());
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message || 'Failed to delete category.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <div style={{ padding: '30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', margin: 0, color: 'var(--color-text-dark)' }}>
              {view === 'list' ? 'Product Categories' : formData.id ? 'Edit Category' : 'New Category'}
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', margin: '5px 0 0', color: 'var(--color-text-muted)' }}>
              {view === 'list' ? 'Organize your catalog into beautiful collections.' : 'Enter the details for this category below.'}
            </p>
          </div>
          <button 
            onClick={onHide}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        {view === 'list' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button 
                onClick={() => openForm()}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '10px 20px', backgroundColor: 'var(--color-text-dark)', 
                  color: '#fff', border: 'none', cursor: 'pointer', 
                  fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' 
                }}
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px' }}>
                <Tag size={40} color="var(--color-text-muted)" style={{ opacity: 0.3, marginBottom: '15px' }} />
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>No categories found.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--color-bg-light)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '18px', margin: '0 0 5px', color: 'var(--color-text-dark)' }}>{cat.title}</h4>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 5px' }}>/{cat.slug}</p>
                      {cat.description && (
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                      <button 
                        onClick={() => openForm(cat)}
                        style={{ padding: '8px', background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text-dark)' }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat)}
                        style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputRow label="Category Title" value={formData.title} onChange={handleTitleChange} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>URL Slug</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  className="auth-input"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
                />
              </div>

              <InputRow label="Description (Optional)" value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} isTextarea />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button 
                onClick={closeForm}
                style={{ padding: '12px 25px', backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '12px 25px', backgroundColor: 'var(--color-text-dark)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Save Category
              </button>
            </div>
          </>
        )}
        
      </div>
    </Modal>
  );
};

export default CategoriesModal;
