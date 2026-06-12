import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Tab } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Trash2, Edit2, Check, ExternalLink } from 'lucide-react';
import { supabase } from '../../supabase';
import { fetchProducts } from '../../store/productsSlice';
import { addToast, showBlockingLoader, hideBlockingLoader } from '../../store/uiSlice';
import InputRow from '../ui/InputRow';
import MediaInput from '../ui/MediaInput';
import { processAndUploadMedia } from '../../utils/mediaManager';
import { useConfirm } from '../ui/ConfirmProvider';

const slugify = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const ProductEditorModal = ({ show, onHide, initialProduct = null, onManageCategories }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.products);
  const { confirm } = useConfirm();

  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info State
  const [productData, setProductData] = useState({
    id: null,
    title: '',
    slug: '',
    description: '',
    category_id: '',
    is_active: true
  });

  // Variants State
  const [variants, setVariants] = useState([]);
  const [deletedVariants, setDeletedVariants] = useState([]);

  // Variant Editor State
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState(-1);
  const [variantForm, setVariantForm] = useState({
    sku: '',
    title: '',
    price: '0.00',
    compare_at_price: '',
    inventory_quantity: '0',
    weight: '1.0',
    attributes: [],
    features: [],
    media: [], // Array of { fileOrUrl, alt_text }
    is_active: true
  });

  // Reset/Load Data
  useEffect(() => {
    if (show) {
      setActiveTab('basic');
      if (initialProduct) {
        setProductData({
          id: initialProduct.id,
          title: initialProduct.title,
          slug: initialProduct.slug,
          description: initialProduct.description || '',
          category_id: initialProduct.category_id,
          is_active: initialProduct.is_active
        });

        // Fetch variants and their media
        const loadVariants = async () => {
          try {
            dispatch(showBlockingLoader('Loading variants...'));
            const { data, error } = await supabase
              .from('product_variants')
              .select('*, product_media(*)')
              .eq('product_id', initialProduct.id);

            if (error) throw error;

            const loadedVariants = data.map(v => ({
              id: v.id,
              sku: v.sku,
              title: v.title,
              price: v.price,
              compare_at_price: v.compare_at_price || '',
              inventory_quantity: v.inventory_quantity,
              weight: v.weight ? v.weight.toString() : '1.0',
              attributes: Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value })),
              features: v.features || [],
              is_active: v.is_active !== false,
              media: (v.product_media || []).sort((a, b) => a.display_order - b.display_order).map(m => ({
                id: m.id,
                fileOrUrl: m.media_url,
                alt_text: m.alt_text || ''
              }))
            }));
            setVariants(loadedVariants);
          } catch (err) {
            dispatch(addToast({ type: 'error', message: 'Failed to load product variants.' }));
          } finally {
            dispatch(hideBlockingLoader());
          }
        };
        loadVariants();
      } else {
        setProductData({ id: null, title: '', slug: '', description: '', category_id: categories.length > 0 ? categories[0].id : '', is_active: true });
        setVariants([]);
      }
      setDeletedVariants([]);
      setEditingVariantIndex(-1);
      setIsVariantFormOpen(false);
    }
  }, [show, initialProduct, categories, dispatch]);

  const handleTitleChange = (val) => {
    if (!productData.id || !productData.slug) {
      setProductData(prev => ({ ...prev, title: val, slug: slugify(val) }));
    } else {
      setProductData(prev => ({ ...prev, title: val }));
    }
  };

  // --- Variant Sub-Form Logic ---
  const openVariantForm = (index = -1) => {
    if (index >= 0) {
      const v = variants[index];
      setVariantForm({
        sku: v.sku,
        title: v.title,
        price: v.price,
        compare_at_price: v.compare_at_price || '',
        inventory_quantity: v.inventory_quantity.toString(),
        weight: v.weight || '1.0',
        attributes: [...(v.attributes || [])],
        features: [...(v.features || [])],
        media: [...v.media],
        is_active: v.is_active !== false
      });
      setEditingVariantIndex(index);
    } else {
      setVariantForm({
        sku: '',
        title: '',
        price: '0.00',
        compare_at_price: '',
        inventory_quantity: '0',
        weight: '1.0',
        attributes: [],
        features: [],
        media: [],
        is_active: true
      });
      setEditingVariantIndex(-1);
    }
    setIsVariantFormOpen(true);
  };

  const closeVariantForm = () => {
    setEditingVariantIndex(-1);
    setIsVariantFormOpen(false);
  };

  const saveVariantForm = () => {
    if (!variantForm.sku || !variantForm.title) {
      dispatch(addToast({ type: 'warning', message: 'Variant SKU and Title are required.' }));
      return;
    }
    
    if (parseFloat(variantForm.price) < 0) {
      dispatch(addToast({ type: 'warning', message: 'Price cannot be less than 0.' }));
      return;
    }

    if (parseFloat(variantForm.weight) <= 0 || isNaN(parseFloat(variantForm.weight))) {
      dispatch(addToast({ type: 'warning', message: 'Variant weight must be greater than 0 kg.' }));
      return;
    }

    // Crucial rule: Every variant must have at least 1 image
    if (variantForm.media.length === 0) {
      dispatch(addToast({ type: 'warning', message: 'Each variant must have at least one image.' }));
      return;
    }

    // Crucial rule: Every variant must have at least 1 attribute
    const activeAttributes = variantForm.attributes.filter(a => a.key.trim() !== '');
    if (activeAttributes.length === 0) {
      dispatch(addToast({ type: 'warning', message: 'Each variant must have at least one custom attribute (e.g., Size, Color).' }));
      return;
    }

    // Validate Features
    const activeFeatures = variantForm.features.filter(f => f.trim() !== '');
    
    const newVariant = { ...variantForm, features: activeFeatures };
    if (editingVariantIndex >= 0) {
      const updated = [...variants];
      // preserve ID if editing existing
      newVariant.id = variants[editingVariantIndex].id;
      updated[editingVariantIndex] = newVariant;
      setVariants(updated);
    } else {
      setVariants([...variants, newVariant]);
    }
    closeVariantForm();
  };

  const deleteVariant = async (index) => {
    const isConfirmed = await confirm({
      title: 'Remove Variant',
      description: 'Are you sure you want to remove this variant from the product?',
      confirmText: 'Remove',
      iconType: 'danger'
    });

    if (!isConfirmed) return;

    const updated = [...variants];
    const deleted = updated.splice(index, 1)[0];
    if (deleted.id) {
      setDeletedVariants(prev => [...prev, deleted.id]);
    }
    setVariants(updated);
  };

  const addAttribute = () => {
    setVariantForm(prev => ({ ...prev, attributes: [...prev.attributes, { key: '', value: '' }] }));
  };

  const updateAttribute = (index, field, val) => {
    const updated = [...variantForm.attributes];
    updated[index][field] = val;
    setVariantForm(prev => ({ ...prev, attributes: updated }));
  };

  const removeAttribute = (index) => {
    const updated = [...variantForm.attributes];
    updated.splice(index, 1);
    setVariantForm(prev => ({ ...prev, attributes: updated }));
  };

  const addFeature = () => {
    setVariantForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index, val) => {
    const updated = [...variantForm.features];
    updated[index] = val;
    setVariantForm(prev => ({ ...prev, features: updated }));
  };

  const removeFeature = (index) => {
    const updated = [...variantForm.features];
    updated.splice(index, 1);
    setVariantForm(prev => ({ ...prev, features: updated }));
  };

  const addMediaSlot = () => {
    setVariantForm(prev => ({ ...prev, media: [...prev.media, { fileOrUrl: null, alt_text: '' }] }));
  };

  const updateMediaSlot = (index, fileOrUrl) => {
    const updated = [...variantForm.media];
    updated[index].fileOrUrl = fileOrUrl;
    setVariantForm(prev => ({ ...prev, media: updated }));
  };

  const removeMediaSlot = (index) => {
    const updated = [...variantForm.media];
    updated.splice(index, 1);
    setVariantForm(prev => ({ ...prev, media: updated }));
  };

  // --- Final Submission ---
  const handleSaveProduct = async () => {
    if (!productData.title || !productData.slug || !productData.category_id) {
      dispatch(addToast({ type: 'warning', message: 'Title, Slug, and Category are required.' }));
      setActiveTab('basic');
      return;
    }

    if (variants.length === 0) {
      dispatch(addToast({ type: 'warning', message: 'A product must have at least one variant.' }));
      setActiveTab('variants');
      return;
    }

    try {
      dispatch(showBlockingLoader('Saving product and processing media...'));

      // 1. Process all media uploads
      const processedVariants = [];

      for (const v of variants) {
        if (v.media.length === 0) {
          throw new Error(`Variant "${v.title}" has no media. Each variant requires at least 1 image.`);
        }

        const processedMedia = [];
        let displayOrder = 0;

        for (const m of v.media) {
          if (!m.fileOrUrl) continue;

          let mediaUrl = m.fileOrUrl;

          // If it's a File object, we must upload it securely to product_images
          if (m.fileOrUrl instanceof File) {
            mediaUrl = await processAndUploadMedia(m.fileOrUrl, 'product_images');
          }

          processedMedia.push({
            media_url: mediaUrl,
            media_type: 'image', // Product media is ALWAYS an image
            display_order: displayOrder++,
            alt_text: m.alt_text || ''
          });
        }

        processedVariants.push({
          id: v.id,
          sku: v.sku,
          title: v.title,
          price: parseFloat(v.price) || 0,
          compare_at_price: parseFloat(v.compare_at_price) || null,
          inventory_quantity: parseInt(v.inventory_quantity) || 0,
          weight: parseFloat(v.weight) || 1.0,
          features: v.features || [],
          attributes: (v.attributes || []).reduce((acc, curr) => {
            if (curr.key && curr.key.trim() !== '') {
              acc[curr.key.trim()] = curr.value;
            }
            return acc;
          }, {}),
          is_active: v.is_active !== false,
          media: processedMedia
        });
      }

      // 2. Call RPC
      const rpcName = productData.id ? 'update_product' : 'create_product';
      
      const pData = {
        category_id: productData.category_id,
        slug: productData.slug,
        title: productData.title,
        description: productData.description,
        is_active: productData.is_active,
        is_featured: false
      };

      const rpcArgs = productData.id ? {
        p_id: productData.id,
        p_data: pData,
        v_upsert: processedVariants,
        v_delete: deletedVariants
      } : {
        p_data: pData,
        v_data: processedVariants
      };

      const { data, error } = await supabase.rpc(rpcName, rpcArgs);

      if (error) {
        // Humanize common db constraint errors
        if (error.message && error.message.includes('unique constraint')) {
          throw new Error('A product or variant with this SKU/Slug already exists.');
        }
        throw error;
      }

      dispatch(addToast({ type: 'success', message: `Product ${productData.id ? 'updated' : 'created'} successfully!` }));
      dispatch(fetchProducts({ page: 1 }));
      onHide();

    } catch (error) {
      dispatch(addToast({ type: 'error', message: error.message || 'Failed to save product.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };


  return (
    <Modal show={show} onHide={onHide} centered size="xl" backdrop="static" keyboard={false}>
      <div style={{ padding: '30px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className='mb-lg-0 mb-3'>
            <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', margin: 0, color: 'var(--color-text-dark)' }}>
              {productData.id ? 'Edit Product' : 'Create Product'}
            </h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', margin: '5px 0 0', color: 'var(--color-text-muted)' }}>
              {productData.id ? 'Update product details and inventory.' : 'Add a new product to your catalog.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={onHide}
              style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              style={{ background: 'var(--color-text-dark)', border: 'none', color: '#fff', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              Save Product
            </button>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 modern-tabs"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}
        >
          {/* TAB 1: BASIC INFO */}
          <Tab eventKey="basic" title="Basic Info">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginTop: '20px' }}>

              {/* Left Col */}
              <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
                <InputRow label="Product Title" value={productData.title} onChange={handleTitleChange} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>URL Slug</label>
                  <input
                    type="text"
                    value={productData.slug}
                    onChange={(e) => setProductData(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                    className="auth-input"
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>

                <InputRow label="Description" value={productData.description} onChange={val => setProductData(prev => ({ ...prev, description: val }))} isTextarea />
              </div>

              {/* Right Col */}
              <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                <div style={{ padding: '20px', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', marginBottom: '15px' }}>Organization</h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <label style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Category</label>
                    <select
                      value={productData.category_id}
                      onChange={(e) => setProductData(prev => ({ ...prev, category_id: e.target.value }))}
                      className="auth-input"
                      style={{ width: '100%', backgroundColor: '#fff', cursor: 'pointer' }}
                    >
                      <option value="" disabled>Select a category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={onManageCategories}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary-dark)', fontSize: '11px', textAlign: 'left', padding: '5px 0', cursor: 'pointer', fontFamily: 'var(--font-sans)', textDecoration: 'underline' }}
                    >
                      Manage Categories
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="product_is_active"
                      checked={productData.is_active}
                      onChange={(e) => setProductData(prev => ({ ...prev, is_active: e.target.checked }))}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="product_is_active" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer' }}>Active (Visible to customers)</label>
                  </div>
                </div>
              </div>
            </div>
          </Tab>

          {/* TAB 2: VARIANTS */}
          <Tab eventKey="variants" title={`Variants (${variants.length})`}>
            <div style={{ marginTop: '20px' }}>

              {!isVariantFormOpen ? (
                // Variants List View
                <>
                  <div style={{ flexWrap: 'wrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <p className='mb-lg-0 mb-2' style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                      Products require at least one variant (e.g. "Default", "Small / Red").
                    </p>
                    <button
                      onClick={() => openVariantForm()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'var(--color-text-dark)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>

                  {variants.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-bg-light)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>No variants added yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {variants.map((v, idx) => (
                        <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>

                          {/* Thumbnails Preview */}
                          <div style={{ width: '80px', height: '80px', flexShrink: 0, backgroundColor: 'var(--color-bg-light)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {v.media.length > 0 && v.media[0].fileOrUrl ? (
                              <img
                                src={v.media[0].fileOrUrl instanceof File ? URL.createObjectURL(v.media[0].fileOrUrl) : v.media[0].fileOrUrl}
                                alt="preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '10px', color: '#999' }}>No Img</span>
                            )}
                          </div>

                          {/* Info Preview */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                              <h4 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '16px', margin: '0 0 5px', color: 'var(--color-text-dark)' }}>{v.title}</h4>
                              <span className='mb-lg-0 mb-2' style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-dark)', fontWeight: 500 }}>
                                {!v.is_active && <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginRight: '8px', textTransform: 'uppercase' }}>Inactive</span>}
                                ₦{parseFloat(v.price).toFixed(2)}
                              </span>
                            </div>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 5px' }}>SKU: {v.sku}</p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: v.inventory_quantity > 0 ? '#10b981' : '#ef4444', margin: 0 }}>
                              Stock: {v.inventory_quantity}
                            </p>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '5px' }}>
                              {v.attributes && v.attributes.length > 0 && (
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                                  {v.attributes.map(a => `${a.key}: ${a.value}`).join(' | ')}
                                </p>
                              )}
                              {v.features && v.features.length > 0 && (
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-primary-dark)', margin: 0, fontWeight: 500 }}>
                                  {v.features.length} Feature{v.features.length > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => openVariantForm(idx)} style={{ padding: '8px', background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text-dark)' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteVariant(idx)} style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Variant Edit Sub-Form
                <div style={{ padding: '20px', backgroundColor: '#f9fafa', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: 0 }}>
                      {editingVariantIndex >= 0 ? 'Edit Variant' : 'New Variant'}
                    </h4>
                  </div>

                  {/* Card 1: Basic Info */}
                  <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 5px' }}>Basic Info</h5>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Identity and tracking for this variant.</p>
                    </div>
                    <div className="variant-grid">
                      <InputRow label="Variant Title (e.g. Default, Small / Red)" value={variantForm.title} onChange={val => setVariantForm(prev => ({ ...prev, title: val }))} />
                      <InputRow label="SKU" value={variantForm.sku} onChange={val => setVariantForm(prev => ({ ...prev, sku: val }))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                      <input 
                        type="checkbox" 
                        id="variant_is_active"
                        checked={variantForm.is_active}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="variant_is_active" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer' }}>Active (Visible to customers)</label>
                    </div>
                  </div>

                  {/* Card 2: Pricing & Stock */}
                  <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 5px' }}>Pricing, Inventory & Shipping</h5>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Set the cost, track stock limits, and shipping weight.</p>
                    </div>
                    <div className="variant-grid">
                      <InputRow label="Price (₦)" value={variantForm.price} onChange={val => setVariantForm(prev => ({ ...prev, price: val }))} />
                      <InputRow label="Compare At Price (Optional)" value={variantForm.compare_at_price} onChange={val => setVariantForm(prev => ({ ...prev, compare_at_price: val }))} />
                      <InputRow label="Inventory Quantity" value={variantForm.inventory_quantity} onChange={val => setVariantForm(prev => ({ ...prev, inventory_quantity: val }))} />
                      <InputRow label="Weight (kg)" value={variantForm.weight} onChange={val => setVariantForm(prev => ({ ...prev, weight: val }))} />
                    </div>
                  </div>

                  {/* Card 3: Dynamic Attributes */}
                  <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className='mb-lg-0 mb-3'>
                        <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 5px' }}>Custom Attributes</h5>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Required: Must have at least 1 attribute (e.g. Size, Color).</p>
                      </div>
                      <button
                        onClick={addAttribute}
                        className='mb-lg-0 mb-2'
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Attribute
                      </button>
                    </div>

                    {variantForm.attributes.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(0,0,0,0.2)' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#ef4444', margin: 0 }}>No attributes added. You must add at least one.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {variantForm.attributes.map((attr, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="e.g. Size"
                              value={attr.key}
                              onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                              className="auth-input"
                              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                            />
                            <input
                              type="text"
                              placeholder="e.g. XL"
                              value={attr.value}
                              onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                              className="auth-input"
                              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                            />
                            <button
                              onClick={() => removeAttribute(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card 3.5: Features */}
                  <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className='mb-lg-0 mb-3'>
                        <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 5px' }}>Features (Optional)</h5>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>List specific highlights (e.g. Waterproof, 2 Year Warranty).</p>
                      </div>
                      <button
                        onClick={addFeature}
                        className='mb-lg-0 mb-2'
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Feature
                      </button>
                    </div>

                    {variantForm.features.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No features added.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {variantForm.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="e.g. Scratch Resistant"
                              value={feat}
                              onChange={(e) => updateFeature(idx, e.target.value)}
                              className="auth-input"
                              style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                            />
                            <button
                              onClick={() => removeFeature(idx)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card 4: Media Slots */}
                  <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div className='mb-lg-0 mb-3'>
                        <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 5px' }}>Images</h5>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Required: Must have at least 1 image.</p>
                      </div>
                      <button
                        onClick={addMediaSlot}
                        className='mb-lg-0 mb-2'
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add Image Slot
                      </button>
                    </div>

                    {variantForm.media.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed rgba(0,0,0,0.2)' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#ef4444', margin: 0 }}>Click "Add Image Slot" to attach images. Must have at least 1.</p>
                      </div>
                    ) : (
                      <div className="variant-grid">
                        {variantForm.media.map((m, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <button
                              onClick={() => removeMediaSlot(idx)}
                              style={{ position: 'absolute', top: '-10px', right: '-10px', zIndex: 10, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                              <X size={12} />
                            </button>
                            <MediaInput
                              value={m.fileOrUrl}
                              onChange={(file) => updateMediaSlot(idx, file)}
                              accept="image/*"
                              typeHint="Images only (< 3MB). Will upload on product save."
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      onClick={closeVariantForm}
                      style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveVariantForm}
                      style={{ background: 'var(--color-text-dark)', border: 'none', color: '#fff', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
                    >
                      Stage Variant
                    </button>
                  </div>

                </div>
              )}
            </div>
          </Tab>
        </Tabs>

      </div>

      <style>{`
        .modern-tabs .nav-link {
          color: var(--color-text-muted);
          font-family: var(--font-sans);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: none;
          background: transparent;
          padding: 15px 20px;
        }
        .modern-tabs .nav-link.active {
          color: var(--color-text-dark);
          border-bottom: 2px solid var(--color-text-dark);
          font-weight: 500;
        }
        
        .variant-grid {
          display: grid;
          gap: 20px;
        }
        @media (min-width: 769px) {
          .variant-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .variant-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ProductEditorModal;
