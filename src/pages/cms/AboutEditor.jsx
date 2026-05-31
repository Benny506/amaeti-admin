import React from 'react';
import { Accordion } from 'react-bootstrap';
import MediaInput from '../../components/ui/MediaInput';
import InputRow from '../../components/ui/InputRow';

const AboutEditor = ({ content, onChange, onDirty }) => {

  const updateField = (section, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section], [field]: value };
    onChange(newContent);
  };

  const updateArrayString = (section, arrayKey, index, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section] };
    newContent[section][arrayKey] = [...content[section][arrayKey]];
    newContent[section][arrayKey][index] = value;
    onChange(newContent);
  };

  const updateArrayItem = (section, arrayKey, index, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section] };
    newContent[section][arrayKey] = [...content[section][arrayKey]];
    newContent[section][arrayKey][index] = { ...content[section][arrayKey][index], [field]: value };
    onChange(newContent);
  };

  return (
    <Accordion defaultActiveKey="0">
      
      {/* 1. Hero Section */}
      <Accordion.Item eventKey="0" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>About Hero Banner</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow onDirty={onDirty} label="Title" value={content.about_hero?.title} onChange={(val) => updateField('about_hero', 'title', val)} />
          <InputRow onDirty={onDirty} label="Subtitle" value={content.about_hero?.subtitle} onChange={(val) => updateField('about_hero', 'subtitle', val)} />
          <MediaInput 
            label="Background Image" 
            value={content.about_hero?.background_image_src} 
            onChange={(val) => updateField('about_hero', 'background_image_src', val)} 
          />
        </Accordion.Body>
      </Accordion.Item>

      {/* 2. Founder Section */}
      <Accordion.Item eventKey="1" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Founder Section</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow onDirty={onDirty} label="Quote" value={content.founder_section?.quote} onChange={(val) => updateField('founder_section', 'quote', val)} isTextarea />
          
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '30px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>Bio Paragraphs</h4>
          {content.founder_section?.bio_paragraphs?.map((para, index) => (
            <InputRow onDirty={onDirty} key={index} label={`Paragraph ${index + 1}`} value={para} onChange={(val) => updateArrayString('founder_section', 'bio_paragraphs', index, val)} isTextarea />
          ))}

          <MediaInput 
            label="Founder Image" 
            value={content.founder_section?.image_src} 
            onChange={(val) => updateField('founder_section', 'image_src', val)} 
          />
        </Accordion.Body>
      </Accordion.Item>

      {/* 3. Mission & Vision */}
      <Accordion.Item eventKey="2" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Mission & Vision</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '20px', backgroundColor: '#faf9f6' }}>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Mission</h5>
            <InputRow onDirty={onDirty} label="Title" value={content.mission_vision?.mission_title} onChange={(val) => updateField('mission_vision', 'mission_title', val)} />
            <InputRow onDirty={onDirty} label="Text" value={content.mission_vision?.mission_text} onChange={(val) => updateField('mission_vision', 'mission_text', val)} isTextarea />
          </div>
          <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#faf9f6' }}>
            <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Vision</h5>
            <InputRow onDirty={onDirty} label="Title" value={content.mission_vision?.vision_title} onChange={(val) => updateField('mission_vision', 'vision_title', val)} />
            <InputRow onDirty={onDirty} label="Text" value={content.mission_vision?.vision_text} onChange={(val) => updateField('mission_vision', 'vision_text', val)} isTextarea />
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* 4. Core Values */}
      <Accordion.Item eventKey="3" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Core Values</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow onDirty={onDirty} label="Section Title" value={content.core_values?.title} onChange={(val) => updateField('core_values', 'title', val)} />
          
          <div className="editor-grid-2" style={{ marginTop: '20px' }}>
            {content.core_values?.values?.map((item, index) => (
              <div key={index} style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#faf9f6' }}>
                <InputRow onDirty={onDirty} label="Value Title" value={item.title} onChange={(val) => updateArrayItem('core_values', 'values', index, 'title', val)} />
                <InputRow onDirty={onDirty} label="Description" value={item.desc} onChange={(val) => updateArrayItem('core_values', 'values', index, 'desc', val)} isTextarea />
              </div>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* 5. Atelier & Craft */}
      <Accordion.Item eventKey="4" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0' }}>
        <Accordion.Header>Atelier & Craft</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow onDirty={onDirty} label="Title" value={content.atelier_craft?.title} onChange={(val) => updateField('atelier_craft', 'title', val)} />
          
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '30px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>Paragraphs</h4>
          {content.atelier_craft?.paragraphs?.map((para, index) => (
            <InputRow onDirty={onDirty} key={index} label={`Paragraph ${index + 1}`} value={para} onChange={(val) => updateArrayString('atelier_craft', 'paragraphs', index, val)} isTextarea />
          ))}

          <MediaInput 
            label="Craft Image" 
            value={content.atelier_craft?.image_src} 
            onChange={(val) => updateField('atelier_craft', 'image_src', val)} 
          />
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
};

export default AboutEditor;
