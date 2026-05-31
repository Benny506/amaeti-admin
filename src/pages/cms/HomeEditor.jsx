import React from 'react';
import { Accordion } from 'react-bootstrap';
import MediaInput from '../../components/ui/MediaInput';
import InputRow from '../../components/ui/InputRow';



const HomeEditor = ({ content, onChange, onDirty }) => {

  // Helper to deep clone and update a nested field
  const updateField = (section, field, value, index = null, subfield = null) => {
    const updated = JSON.parse(JSON.stringify(content));
    
    // Because JSON.stringify kills File objects, we have to copy them over manually
    // if there are any File objects currently in the tree. 
    // To make this simple without a complex deep clone utility:
    // We will shallow-copy the top level and the section.
    
    const newContent = { ...content };
    newContent[section] = { ...content[section] };

    if (index !== null) {
      // It's an array item
      newContent[section].slides = [...(content[section].slides || content[section].items || [])];
      
      if (subfield) {
        newContent[section].slides[index] = { ...content[section].slides[index] };
        if (field) { // e.g., left.title
           newContent[section].slides[index][field] = { ...content[section].slides[index][field], [subfield]: value };
        } else {
           newContent[section].slides[index][subfield] = value;
        }
      } else {
        newContent[section].slides[index] = { ...content[section].slides[index], [field]: value };
      }
    } else {
      // It's a direct object field
      newContent[section][field] = value;
    }

    onChange(newContent);
  };

  // Dedicated array helpers
  const updateArrayItem = (section, arrayKey, index, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section] };
    newContent[section][arrayKey] = [...content[section][arrayKey]];
    newContent[section][arrayKey][index] = { ...content[section][arrayKey][index], [field]: value };
    onChange(newContent);
  };

  const updateNestedArrayItem = (section, arrayKey, index, nestedKey, field, value) => {
    const newContent = { ...content };
    newContent[section] = { ...content[section] };
    newContent[section][arrayKey] = [...content[section][arrayKey]];
    newContent[section][arrayKey][index] = { ...content[section][arrayKey][index] };
    newContent[section][arrayKey][index][nestedKey] = { ...content[section][arrayKey][index][nestedKey], [field]: value };
    onChange(newContent);
  };

  return (
    <Accordion defaultActiveKey="0">
      
      {/* 1. Hero Carousel */}
      <Accordion.Item eventKey="0" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Hero Carousel</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          {content.hero_carousel?.slides?.map((slide, index) => (
            <div key={index} style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '30px', backgroundColor: '#faf9f6' }}>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>Slide {index + 1}</h4>
              <InputRow onDirty={onDirty} label="Subtitle" value={slide.subtitle} onChange={(val) => updateArrayItem('hero_carousel', 'slides', index, 'subtitle', val)} />
              <InputRow onDirty={onDirty} label="Title" value={slide.title} onChange={(val) => updateArrayItem('hero_carousel', 'slides', index, 'title', val)} />
              <InputRow onDirty={onDirty} label="Description" value={slide.desc} onChange={(val) => updateArrayItem('hero_carousel', 'slides', index, 'desc', val)} isTextarea />
              <InputRow onDirty={onDirty} label="Button Text" value={slide.button_text} onChange={(val) => updateArrayItem('hero_carousel', 'slides', index, 'button_text', val)} />
              <MediaInput 
                label="Background Video/Image" 
                value={slide.video_src} 
                onChange={(fileOrUrl) => updateArrayItem('hero_carousel', 'slides', index, 'video_src', fileOrUrl)} 
              />
            </div>
          ))}
        </Accordion.Body>
      </Accordion.Item>

      {/* 2. Atelier Section */}
      <Accordion.Item eventKey="1" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>The Atelier Philosophy</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow onDirty={onDirty} label="Subtitle" value={content.atelier_section?.subtitle} onChange={(val) => updateField('atelier_section', 'subtitle', val)} />
          <InputRow onDirty={onDirty} label="Quote" value={content.atelier_section?.quote} onChange={(val) => updateField('atelier_section', 'quote', val)} />
          <InputRow onDirty={onDirty} label="Body Text" value={content.atelier_section?.body} onChange={(val) => updateField('atelier_section', 'body', val)} isTextarea />
          <div className="editor-grid-2">
            <div style={{ flex: 1 }}><InputRow onDirty={onDirty} label="Button 1 Text" value={content.atelier_section?.button_1_text} onChange={(val) => updateField('atelier_section', 'button_1_text', val)} /></div>
            <div style={{ flex: 1 }}><InputRow onDirty={onDirty} label="Button 2 Text" value={content.atelier_section?.button_2_text} onChange={(val) => updateField('atelier_section', 'button_2_text', val)} /></div>
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* 3. Showcase Section */}
      <Accordion.Item eventKey="2" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Showcase Section</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow label="Section Title" value={content.showcase_section?.title} onChange={(val) => updateField('showcase_section', 'title', val)} />
          <InputRow label="Section Subtitle" value={content.showcase_section?.subtitle} onChange={(val) => updateField('showcase_section', 'subtitle', val)} />
          
          <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '30px 0 20px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>Products</h4>
          <div className="editor-grid-2">
            {content.showcase_section?.items?.map((item, index) => (
              <div key={index} style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#faf9f6' }}>
                <InputRow label="Product Name" value={item.name} onChange={(val) => updateArrayItem('showcase_section', 'items', index, 'name', val)} />
                <InputRow label="Price" value={item.price} onChange={(val) => updateArrayItem('showcase_section', 'items', index, 'price', val)} />
                <MediaInput 
                  label="Product Media" 
                  value={item.src} 
                  onChange={(val) => updateArrayItem('showcase_section', 'items', index, 'src', val)} 
                />
              </div>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>

      {/* 4. Featured Collection */}
      <Accordion.Item eventKey="3" style={{ border: '1px solid rgba(0,0,0,0.1)', marginBottom: '20px', borderRadius: '0' }}>
        <Accordion.Header>Featured Collection (Split Grid)</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          {content.featured_collection?.slides?.map((slide, index) => (
            <div key={index} className="editor-grid-2" style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: '20px', backgroundColor: '#faf9f6' }}>
              <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Left Block</h5>
                <InputRow label="Title" value={slide.left.title} onChange={(val) => updateNestedArrayItem('featured_collection', 'slides', index, 'left', 'title', val)} />
                <MediaInput value={slide.left.src} onChange={(val) => updateNestedArrayItem('featured_collection', 'slides', index, 'left', 'src', val)} />
              </div>
              <div style={{ flex: 1, paddingLeft: '20px' }}>
                <h5 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px' }}>Right Block</h5>
                <InputRow label="Title" value={slide.right.title} onChange={(val) => updateNestedArrayItem('featured_collection', 'slides', index, 'right', 'title', val)} />
                <MediaInput value={slide.right.src} onChange={(val) => updateNestedArrayItem('featured_collection', 'slides', index, 'right', 'src', val)} />
              </div>
            </div>
          ))}
        </Accordion.Body>
      </Accordion.Item>

      {/* 5. Philosophy Banner */}
      <Accordion.Item eventKey="4" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0' }}>
        <Accordion.Header>Philosophy Banner (Footer)</Accordion.Header>
        <Accordion.Body className="editor-accordion-body">
          <InputRow label="Title" value={content.philosophy_banner?.title} onChange={(val) => updateField('philosophy_banner', 'title', val)} />
          <InputRow label="Quote" value={content.philosophy_banner?.quote} onChange={(val) => updateField('philosophy_banner', 'quote', val)} isTextarea />
          <InputRow label="Button Text" value={content.philosophy_banner?.button_text} onChange={(val) => updateField('philosophy_banner', 'button_text', val)} />
          <MediaInput 
            label="Background Image" 
            value={content.philosophy_banner?.background_image_src} 
            onChange={(val) => updateField('philosophy_banner', 'background_image_src', val)} 
            typeHint="Will be aggressively compressed and converted to WebP"
          />
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
};

export default HomeEditor;
