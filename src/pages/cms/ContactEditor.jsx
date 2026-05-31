import React, { useState } from 'react';
import { Accordion, Modal } from 'react-bootstrap';
import MediaInput from '../../components/ui/MediaInput';
import InputRow from '../../components/ui/InputRow';
import { Plus } from 'lucide-react';

const ContactEditor = ({ content, onChange, onDirty }) => {
  const [showModal, setShowModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  const updateField = (section, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section], [field]: value };
    onChange(newContent);
  };

  const updateArrayItem = (section, arrayKey, index, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section] };
    newContent[section][arrayKey] = [...content[section][arrayKey]];
    newContent[section][arrayKey][index] = { ...content[section][arrayKey][index], [field]: value };
    onChange(newContent);
  };

  const addFaqItem = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;

    const newContent = { ...content };
    newContent.faqs = { ...content.faqs };
    newContent.faqs.items = [...(content.faqs.items || []), newFaq];
    
    onChange(newContent);
    if (onDirty) onDirty();
    
    setShowModal(false);
    setNewFaq({ question: '', answer: '' });
  };

  return (
    <>
      <Accordion defaultActiveKey="0">
        
        {/* 1. Hero Section */}
        <Accordion.Item eventKey="0" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
          <Accordion.Header>Contact Hero Banner</Accordion.Header>
          <Accordion.Body className="editor-accordion-body">
            <InputRow onDirty={onDirty} label="Title" value={content.contact_hero?.title} onChange={(val) => updateField('contact_hero', 'title', val)} />
            <MediaInput 
              label="Background Image" 
              value={content.contact_hero?.background_image_src} 
              onChange={(val) => updateField('contact_hero', 'background_image_src', val)} 
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* 2. Contact Details */}
        <Accordion.Item eventKey="1" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
          <Accordion.Header>Contact Details</Accordion.Header>
          <Accordion.Body className="editor-accordion-body">
            <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>Contact Blocks</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {content.contact_details?.blocks?.map((block, index) => (
                <div key={index} style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#faf9f6' }}>
                  <InputRow onDirty={onDirty} label="Block Title" value={block.title} onChange={(val) => updateArrayItem('contact_details', 'blocks', index, 'title', val)} />
                  <InputRow onDirty={onDirty} label="Block Text" value={block.text} onChange={(val) => updateArrayItem('contact_details', 'blocks', index, 'text', val)} />
                </div>
              ))}
            </div>

            <InputRow onDirty={onDirty} label="Footer Text (Supports HTML)" value={content.contact_details?.footer_text} onChange={(val) => updateField('contact_details', 'footer_text', val)} isTextarea />
          </Accordion.Body>
        </Accordion.Item>

        {/* 3. FAQs */}
        <Accordion.Item eventKey="2" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0' }}>
          <Accordion.Header>Frequently Asked Questions</Accordion.Header>
          <Accordion.Body className="editor-accordion-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>FAQ Items</h4>
              <button 
                onClick={() => setShowModal(true)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '8px 15px', backgroundColor: 'var(--color-text-dark)', 
                  color: '#fff', border: 'none', cursor: 'pointer', 
                  fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' 
                }}
              >
                <Plus size={14} />
                Add FAQ
              </button>
            </div>

            <InputRow onDirty={onDirty} label="Section Title" value={content.faqs?.title} onChange={(val) => updateField('faqs', 'title', val)} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              {content.faqs?.items?.map((item, index) => (
                <div key={index} style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#faf9f6' }}>
                  <InputRow onDirty={onDirty} label={`Question ${index + 1}`} value={item.question} onChange={(val) => updateArrayItem('faqs', 'items', index, 'question', val)} />
                  <InputRow onDirty={onDirty} label="Answer" value={item.answer} onChange={(val) => updateArrayItem('faqs', 'items', index, 'answer', val)} isTextarea />
                </div>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>

      </Accordion>

      {/* Add FAQ Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <div style={{ padding: '30px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '24px', marginBottom: '20px' }}>Add New FAQ</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Question</label>
            <input 
              type="text" 
              value={newFaq.question} 
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              className="auth-input"
              style={{ width: '100%' }}
              placeholder="e.g. Do you ship internationally?"
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Answer</label>
            <textarea 
              value={newFaq.answer} 
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              className="auth-input"
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
              placeholder="Enter the answer..."
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >
              Cancel
            </button>
            <button 
              onClick={addFaqItem}
              disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: (!newFaq.question.trim() || !newFaq.answer.trim()) ? '#ccc' : 'var(--color-text-dark)', 
                color: '#fff', border: 'none', cursor: (!newFaq.question.trim() || !newFaq.answer.trim()) ? 'not-allowed' : 'pointer', 
                fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' 
              }}
            >
              Add to List
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ContactEditor;
