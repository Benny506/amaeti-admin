import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showBlockingLoader, hideBlockingLoader, setAdminHeader } from '../store/uiSlice';
import { fetchSiteContent, saveSiteContent } from '../store/contentSlice';
import { useConfirm } from '../components/ui/ConfirmProvider';
import { RefreshCcw, Save } from 'lucide-react';
import { processAndUploadMedia, deleteOldMedia } from '../utils/mediaManager';
import HomeEditor from './cms/HomeEditor';
import AboutEditor from './cms/AboutEditor';
import ContactEditor from './cms/ContactEditor';
import LegalEditor from './cms/LegalEditor';

const PAGES = [
  { id: 'home', label: 'Home Page' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact Page' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'terms-of-use', label: 'Terms of Use' },
];

const SiteContent = () => {
  const dispatch = useDispatch();
  const { confirm } = useConfirm();
  const { data, loading } = useSelector((state) => state.content);

  const [activePage, setActivePage] = useState('home');
  const [localContent, setLocalContent] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync Redux -> Local State when active page changes or fetch completes
  useEffect(() => {
    if (data[activePage]) {
      setLocalContent(JSON.parse(JSON.stringify(data[activePage]))); // deep copy for text, we will inject files into it via HomeEditor
      setIsDirty(false);
    }
  }, [data, activePage]);

  // Initial Fetch
  useEffect(() => {
    dispatch(setAdminHeader({
      title: 'Site Content',
      description: 'Manage landing pages, media, and typography across the platform.'
    }));
    dispatch(fetchSiteContent({ slug: activePage }));
  }, [dispatch, activePage]);

  const handlePageSelect = async (newPageId) => {
    if (newPageId === activePage) return;
    
    if (isDirty) {
      const isConfirmed = await confirm({
        title: 'Discard Unsaved Changes?',
        description: 'You have modified this page. Swapping to another page will permanently discard these changes.',
        confirmText: 'Discard Changes',
        iconType: 'danger'
      });
      if (!isConfirmed) return;
    }
    
    setActivePage(newPageId);
    setLocalContent(null);
    setIsDirty(false);
  };

  const handleRefresh = async () => {
    if (isDirty) {
      const isConfirmed = await confirm({
        title: 'Refresh Content?',
        description: 'This will pull the latest content from the database and overwrite your current unsaved edits.',
        confirmText: 'Overwrite',
        iconType: 'warning'
      });
      if (!isConfirmed) return;
    }
    dispatch(fetchSiteContent({ slug: activePage, forceRefresh: true }));
  };

  const handleGlobalSave = async () => {
    if (!localContent) return;

    const isConfirmed = await confirm({
      title: 'Publish Changes?',
      description: 'Are you sure you want to push these changes to the live website? Media will be optimized automatically.',
      confirmText: 'Publish',
      iconType: 'info'
    });

    if (!isConfirmed) return;

    try {
      dispatch(showBlockingLoader('Optimizing & Uploading Media...'));
      // 1. We must process any pending files.
      // We will do a deep traversal of localContent. If any value is a File object, process it.
      const processedContent = await processContentMedia(localContent, data[activePage]);

      // 2. Save to Redux/DB
      await dispatch(saveSiteContent({ slug: activePage, content: processedContent })).unwrap();
      setIsDirty(false);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      dispatch(hideBlockingLoader());
    }
  };

  // Helper to deep traverse and upload files
  const processContentMedia = async (node, originalNode) => {
    if (node instanceof File) {
      // It's a new file to upload
      const newUrl = await processAndUploadMedia(node);
      
      // If we are replacing an existing string URL, delete the old one
      if (typeof originalNode === 'string') {
        await deleteOldMedia(originalNode);
      }
      return newUrl;
    }

    if (Array.isArray(node)) {
      return Promise.all(node.map((item, index) => 
        processContentMedia(item, originalNode ? originalNode[index] : undefined)
      ));
    }

    if (node !== null && typeof node === 'object') {
      const processedObj = {};
      for (const key of Object.keys(node)) {
        processedObj[key] = await processContentMedia(
          node[key], 
          originalNode ? originalNode[key] : undefined
        );
      }
      return processedObj;
    }

    return node; // String, Number, Boolean, etc.
  };

  const renderEditor = () => {
    if (!localContent) return null;

    switch (activePage) {
      case 'home':
        return (
          <HomeEditor 
            content={localContent} 
            onChange={(newContent) => {
              setLocalContent(newContent);
              setIsDirty(true);
            }} 
            onDirty={() => setIsDirty(true)}
          />
        );
      case 'about':
        return (
          <AboutEditor 
            content={localContent} 
            onChange={(newContent) => {
              setLocalContent(newContent);
              setIsDirty(true);
            }} 
            onDirty={() => setIsDirty(true)}
          />
        );
      case 'contact':
        return (
          <ContactEditor 
            content={localContent} 
            onChange={(newContent) => {
              setLocalContent(newContent);
              setIsDirty(true);
            }} 
            onDirty={() => setIsDirty(true)}
          />
        );
      case 'privacy-policy':
      case 'terms-of-use':
        return (
          <LegalEditor 
            content={localContent} 
            onChange={(newContent) => {
              setLocalContent(newContent);
              setIsDirty(true);
            }} 
            onDirty={() => setIsDirty(true)}
          />
        );
      default:
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Editor for {activePage} is under construction.
          </div>
        );
    }
  };

  return (
    <div className="site-content-container">
      
      {/* LEFT: Page Selector */}
      <div className="site-content-sidebar" style={{ flexShrink: 0, backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: 'var(--color-text-muted)' }}>Site Pages</h3>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {PAGES.map((page) => (
            <li key={page.id}>
              <button
                onClick={() => handlePageSelect(page.id)}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  textAlign: 'left',
                  background: activePage === page.id ? 'var(--color-bg-cream)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: activePage === page.id ? 'var(--color-primary-dark)' : 'var(--color-text-dark)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderLeft: activePage === page.id ? '3px solid var(--color-primary-dark)' : '3px solid transparent'
                }}
              >
                {page.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: Editor Area */}
      <div className="site-content-editor">
        
        {/* Editor Toolbar */}
        <div className="editor-toolbar">
          <h2 style={{ fontFamily: 'var(--font-serif-display)', fontSize: '20px', margin: 0 }}>
            {PAGES.find(p => p.id === activePage)?.label}
          </h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={handleRefresh}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px 20px', backgroundColor: 'transparent', 
                border: '1px solid rgba(0,0,0,0.1)', cursor: loading ? 'not-allowed' : 'pointer', 
                fontFamily: 'var(--font-sans)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em' 
              }}
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button 
              onClick={handleGlobalSave}
              disabled={!isDirty || loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', 
                padding: '10px 20px', backgroundColor: (!isDirty || loading) ? '#e0e0e0' : 'var(--color-text-dark)', 
                color: (!isDirty || loading) ? '#999' : '#fff',
                border: 'none', cursor: (!isDirty || loading) ? 'not-allowed' : 'pointer', 
                fontFamily: 'var(--font-sans)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em',
                transition: 'all 0.2s'
              }}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="site-content-form-area">
          {renderEditor()}
        </div>

      </div>
    </div>
  );
};

export default SiteContent;
