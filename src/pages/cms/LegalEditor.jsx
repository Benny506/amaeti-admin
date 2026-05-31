import React, { useState } from 'react';
import { Accordion, Modal } from 'react-bootstrap';
import InputRow from '../../components/ui/InputRow';
import { Plus, Trash2, X } from 'lucide-react';

const LegalEditor = ({ content, onChange, onDirty }) => {
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newSection, setNewSection] = useState({ title: '', paragraphs: [], list: [] });

  const updateField = (field, value) => {
    const newContent = { ...content, [field]: value };
    onChange(newContent);
  };

  const updateSectionField = (index, field, value) => {
    const newContent = { ...content };
    newContent.sections = [...(content.sections || [])];
    newContent.sections[index] = { ...newContent.sections[index], [field]: value };
    onChange(newContent);
  };

  const updateSectionArrayString = (sectionIndex, arrayKey, itemIndex, value) => {
    const newContent = { ...content };
    newContent.sections = [...(content.sections || [])];
    newContent.sections[sectionIndex] = { ...newContent.sections[sectionIndex] };
    newContent.sections[sectionIndex][arrayKey] = [...(newContent.sections[sectionIndex][arrayKey] || [])];
    newContent.sections[sectionIndex][arrayKey][itemIndex] = value;
    onChange(newContent);
  };

  const addArrayItem = (sectionIndex, arrayKey) => {
    const newContent = { ...content };
    newContent.sections = [...(content.sections || [])];
    newContent.sections[sectionIndex] = { ...newContent.sections[sectionIndex] };
    newContent.sections[sectionIndex][arrayKey] = [...(newContent.sections[sectionIndex][arrayKey] || []), ''];
    onChange(newContent);
    if (onDirty) onDirty();
  };

  const removeArrayItem = (sectionIndex, arrayKey, itemIndex) => {
    const newContent = { ...content };
    newContent.sections = [...(content.sections || [])];
    newContent.sections[sectionIndex] = { ...newContent.sections[sectionIndex] };
    const newArr = [...(newContent.sections[sectionIndex][arrayKey] || [])];
    newArr.splice(itemIndex, 1);
    newContent.sections[sectionIndex][arrayKey] = newArr;
    onChange(newContent);
    if (onDirty) onDirty();
  };

  const clearArray = (sectionIndex, arrayKey) => {
    const newContent = { ...content };
    newContent.sections = [...(content.sections || [])];
    newContent.sections[sectionIndex] = { ...newContent.sections[sectionIndex] };
    newContent.sections[sectionIndex][arrayKey] = [];
    onChange(newContent);
    if (onDirty) onDirty();
  };

  const addSection = () => {
    if (!newSection.title.trim()) return;
    
    const newContent = { ...content };
    newContent.sections = [...(content.sections || []), { 
      title: newSection.title, 
      paragraphs: newSection.paragraphs.filter(p => p.trim() !== ''), 
      list: newSection.list.filter(l => l.trim() !== '') 
    }];
    
    onChange(newContent);
    if (onDirty) onDirty();
    
    setShowSectionModal(false);
    setNewSection({ title: '', paragraphs: [], list: [] });
  };

  const removeSection = (index) => {
    const newContent = { ...content };
    const newSections = [...(content.sections || [])];
    newSections.splice(index, 1);
    newContent.sections = newSections;
    onChange(newContent);
    if (onDirty) onDirty();
  };

  return (
    <>
      <Accordion defaultActiveKey="header">
        
        {/* Page Header */}
        <Accordion.Item eventKey="header" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
          <Accordion.Header>Page Header</Accordion.Header>
          <Accordion.Body className="editor-accordion-body">
            <InputRow onDirty={onDirty} label="Page Title" value={content.title} onChange={(val) => updateField('title', val)} />
            <InputRow onDirty={onDirty} label="Last Updated Text" value={content.last_updated} onChange={(val) => updateField('last_updated', val)} />
          </Accordion.Body>
        </Accordion.Item>

        {/* Sections */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '40px 0 20px', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '20px', margin: 0 }}>Content Sections</h3>
          <button 
            onClick={() => setShowSectionModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              padding: '8px 15px', backgroundColor: 'var(--color-text-dark)', 
              color: '#fff', border: 'none', cursor: 'pointer', 
              fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' 
            }}
          >
            <Plus size={14} />
            Add Section
          </button>
        </div>

        {content.sections?.map((section, index) => (
          <Accordion.Item key={index} eventKey={`section-${index}`} style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
            <Accordion.Header>{section.title || `Section ${index + 1}`}</Accordion.Header>
            <Accordion.Body className="editor-accordion-body">
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button 
                  onClick={() => removeSection(index)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 15px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  <Trash2 size={14} />
                  Delete Entire Section
                </button>
              </div>

              <InputRow onDirty={onDirty} label="Section Title" value={section.title} onChange={(val) => updateSectionField(index, 'title', val)} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Paragraphs</h4>
                <button 
                  onClick={() => addArrayItem(index, 'paragraphs')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  <Plus size={12} /> Add Paragraph
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {section.paragraphs?.map((para, pIndex) => (
                  <div key={`p-${pIndex}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <InputRow onDirty={onDirty} label={`Paragraph ${pIndex + 1}`} value={para} onChange={(val) => updateSectionArrayString(index, 'paragraphs', pIndex, val)} isTextarea />
                    </div>
                    <button 
                      onClick={() => removeArrayItem(index, 'paragraphs', pIndex)}
                      style={{ marginTop: '25px', padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove Paragraph"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '30px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
                <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Bullet Points</h4>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => clearArray(index, 'list')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    <X size={12} /> Clear Bullets
                  </button>
                  <button 
                    onClick={() => addArrayItem(index, 'list')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    <Plus size={12} /> Add Bullet
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.list?.map((listItem, lIndex) => (
                  <div key={`l-${lIndex}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <InputRow onDirty={onDirty} label={`Bullet ${lIndex + 1}`} value={listItem} onChange={(val) => updateSectionArrayString(index, 'list', lIndex, val)} />
                    </div>
                    <button 
                      onClick={() => removeArrayItem(index, 'list', lIndex)}
                      style={{ marginTop: '25px', padding: '10px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove Bullet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(!section.list || section.list.length === 0) && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No bullet points in this section.</p>
                )}
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}

      </Accordion>

      {/* Add Section Modal */}
      <Modal show={showSectionModal} onHide={() => setShowSectionModal(false)} centered size="lg">
        <div style={{ padding: '30px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', marginBottom: '20px' }}>Add New Section</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Section Title</label>
            <input 
              type="text" 
              value={newSection.title} 
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              className="auth-input"
              style={{ width: '100%' }}
              placeholder="e.g. Data Collection"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Initial Paragraph</label>
            <textarea 
              value={newSection.paragraphs[0] || ''} 
              onChange={(e) => setNewSection({ ...newSection, paragraphs: [e.target.value] })}
              className="auth-input"
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
              placeholder="Enter paragraph text..."
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '5px' }}>You can add more paragraphs or bullet points later via the section editor.</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button 
              onClick={() => setShowSectionModal(false)}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Cancel
            </button>
            <button 
              onClick={addSection}
              disabled={!newSection.title.trim()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: !newSection.title.trim() ? '#ccc' : 'var(--color-text-dark)', 
                color: '#fff', border: 'none', cursor: !newSection.title.trim() ? 'not-allowed' : 'pointer', 
                fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' 
              }}
            >
              Add Section
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LegalEditor;
