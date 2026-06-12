import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminHeader, addToast, showBlockingLoader, hideBlockingLoader, showSubtleLoader, hideSubtleLoader } from '../store/uiSlice';
import { fetchDeliveryRegions, addRegionLocally, updateRegionLocally, removeRegionLocally } from '../store/deliverySlice';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from 'react-bootstrap';
import InputRow from '../components/ui/InputRow';
import { supabase } from '../supabase';
import { useConfirm } from '../components/ui/ConfirmProvider';

const DeliveryRegions = () => {
  const dispatch = useDispatch();
  const { regions, loading } = useSelector((state) => state.delivery);
  const { confirm } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    threshold: '0.0',
    extra_cost: '0.00',
    flat_fee: '0.00',
    is_active: true
  });

  useEffect(() => {
    dispatch(setAdminHeader({ 
      title: 'Delivery Regions', 
      description: 'Manage shipping zones, thresholds, and costs.' 
    }));

    const loadData = async () => {
      if (regions.length === 0) {
        dispatch(showSubtleLoader('Loading regions...'));
        await dispatch(fetchDeliveryRegions());
        dispatch(hideSubtleLoader());
      }
    };
    loadData();
  }, [dispatch, regions.length]);

  const handleOpenModal = (region = null) => {
    if (region) {
      setEditingRegion(region.id);
      setFormData({
        title: region.title,
        description: region.description || '',
        threshold: region.threshold.toString(),
        extra_cost: region.extra_cost.toString(),
        flat_fee: region.flat_fee.toString(),
        is_active: region.is_active
      });
    } else {
      setEditingRegion(null);
      setFormData({
        title: '',
        description: '',
        threshold: '0.0',
        extra_cost: '0.00',
        flat_fee: '0.00',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      dispatch(addToast({ type: 'warning', message: 'Title is required.' }));
      return;
    }

    if (parseFloat(formData.threshold) < 0 || parseFloat(formData.extra_cost) < 0 || parseFloat(formData.flat_fee) < 0) {
      dispatch(addToast({ type: 'warning', message: 'Costs and thresholds cannot be negative.' }));
      return;
    }

    try {
      dispatch(showBlockingLoader('Saving region...'));

      const payload = {
        title: formData.title,
        description: formData.description,
        threshold: parseFloat(formData.threshold) || 0,
        extra_cost: parseFloat(formData.extra_cost) || 0,
        flat_fee: parseFloat(formData.flat_fee) || 0,
        is_active: formData.is_active
      };

      if (editingRegion) {
        const { data, error } = await supabase
          .from('delivery_regions')
          .update(payload)
          .eq('id', editingRegion)
          .select()
          .single();

        if (error) throw error;
        dispatch(updateRegionLocally(data));
        dispatch(addToast({ type: 'success', message: 'Region updated successfully.' }));
      } else {
        const { data, error } = await supabase
          .from('delivery_regions')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        dispatch(addRegionLocally(data));
        dispatch(addToast({ type: 'success', message: 'Region created successfully.' }));
      }

      setShowModal(false);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to save region.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Region',
      description: 'Are you sure you want to permanently delete this delivery region? This might affect existing carts or orders depending on it.',
      confirmText: 'Delete',
      iconType: 'danger'
    });

    if (!isConfirmed) return;

    try {
      dispatch(showBlockingLoader('Deleting region...'));
      const { error } = await supabase
        .from('delivery_regions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      dispatch(removeRegionLocally(id));
      dispatch(addToast({ type: 'success', message: 'Region deleted.' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete region.' }));
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <button 
          onClick={() => handleOpenModal()}
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
          Create Region
        </button>
      </div>

      {regions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>No delivery regions configured.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-light)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Region</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Fees</th>
                  <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '15px 20px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region) => (
                  <tr key={region.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '15px 20px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-dark)' }}>{region.title}</p>
                      {region.description && <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>{region.description}</p>}
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: '13px', color: 'var(--color-text-dark)' }}>
                      <p style={{ margin: '0 0 4px' }}>Flat: ₦{parseFloat(region.flat_fee).toFixed(2)}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        +{parseFloat(region.extra_cost).toFixed(2)} per extra {parseFloat(region.threshold)}kg
                      </p>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                        backgroundColor: region.is_active ? '#dcfce7' : '#fee2e2',
                        color: region.is_active ? '#166534' : '#991b1b'
                      }}>
                        {region.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button 
                          onClick={() => handleOpenModal(region)}
                          style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-text-dark)' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(region.id)}
                          style={{ background: '#fee2e2', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static" size="lg">
        <div style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', margin: 0, color: 'var(--color-text-dark)' }}>
                {editingRegion ? 'Edit Region' : 'Create Region'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <InputRow label="Region Title (e.g. Lagos, Nationwide)" value={formData.title} onChange={val => setFormData(prev => ({ ...prev, title: val }))} />
            <InputRow label="Description (Optional)" value={formData.description} onChange={val => setFormData(prev => ({ ...prev, description: val }))} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <InputRow label="Flat Fee (₦)" value={formData.flat_fee} onChange={val => setFormData(prev => ({ ...prev, flat_fee: val }))} />
              <InputRow label="Threshold (kg)" value={formData.threshold} onChange={val => setFormData(prev => ({ ...prev, threshold: val }))} />
              <InputRow label="Extra Cost per Threshold (₦)" value={formData.extra_cost} onChange={val => setFormData(prev => ({ ...prev, extra_cost: val }))} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="region_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="region_is_active" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', cursor: 'pointer' }}>Active</label>
            </div>

            {/* Math Preview Section */}
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'var(--color-bg-light)', borderRadius: '8px', border: '1px dashed rgba(0,0,0,0.1)' }}>
              <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-dark)', margin: '0 0 10px' }}>Calculation Preview</h5>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '15px' }}>
                The first <strong>{parseFloat(formData.threshold) || 0}kg</strong> is covered by the flat fee of <strong>₦{parseFloat(formData.flat_fee) || 0}</strong>. 
                For every additional <strong>{parseFloat(formData.threshold) || 0}kg</strong> (or fraction of it), an extra <strong>₦{parseFloat(formData.extra_cost) || 0}</strong> is added.
              </p>
              
              {parseFloat(formData.threshold) > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>Weight: <strong>1kg</strong></span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      ₦{parseFloat(formData.flat_fee) + (1 > parseFloat(formData.threshold) ? Math.ceil((1 - parseFloat(formData.threshold)) / parseFloat(formData.threshold)) * parseFloat(formData.extra_cost) : 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>Weight: <strong>{parseFloat(formData.threshold) || 0}kg</strong></span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      ₦{parseFloat(formData.flat_fee)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>Weight: <strong>{(parseFloat(formData.threshold) || 0) + 1}kg</strong></span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      ₦{(parseFloat(formData.flat_fee) || 0) + (parseFloat(formData.extra_cost) || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>Weight: <strong>{(parseFloat(formData.threshold) || 0) * 2}kg</strong></span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      ₦{(parseFloat(formData.flat_fee) || 0) + (parseFloat(formData.extra_cost) || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-dark)' }}>Weight: <strong>{((parseFloat(formData.threshold) || 0) * 2) + 1}kg</strong></span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      ₦{(parseFloat(formData.flat_fee) || 0) + ((parseFloat(formData.extra_cost) || 0) * 2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: 'none', border: '1px solid rgba(0,0,0,0.1)', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ background: 'var(--color-text-dark)', border: 'none', color: '#fff', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}
            >
              Save Region
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default DeliveryRegions;
