import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  blockingLoader: false,
  subtleLoader: {
    active: false,
    text: '',
  },
  toasts: [], // { id, type: 'success'|'error'|'warning'|'info', message }
  adminHeader: {
    title: '',
    description: ''
  },
  confirmModal: {
    isOpen: false,
    title: '',
    description: '',
    iconType: 'warning', // 'warning', 'info', 'danger'
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null, // We'll handle callbacks via a Promise wrapper in a custom hook, or dispatch events. 
    // Wait, Redux shouldn't hold functions. Better to just hold a unique ID, but a standard pattern is fine if we ignore serialization warnings, or we manage it purely via context. 
    // To avoid Redux serialization warnings, we can use a custom context provider for the Confirm Modal, but since we are using Redux for all UI, let's keep it simple: we won't store the callback in Redux. Instead, we'll build a custom hook/provider for the Confirm Modal, or store the callback if we disable the serializable check.
    // Actually, storing callbacks in Redux is an anti-pattern. I'll use a Context for the Confirm Modal to be perfectly clean. Let's revert this file update and create a ConfirmProvider instead.
  }
};

// I will just revert this change inside my thought process and use Context for the ConfirmModal.
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    blockingLoader: false,
    subtleLoader: { active: false, text: '' },
    toasts: [],
    adminHeader: { title: '', description: '' }
  },
  reducers: {
    showBlockingLoader: (state, action) => { state.blockingLoader = action.payload || true; },
    hideBlockingLoader: (state) => { state.blockingLoader = false; },
    showSubtleLoader: (state, action) => { state.subtleLoader = { active: true, text: action.payload || 'Loading...' }; },
    hideSubtleLoader: (state) => { state.subtleLoader.active = false; },
    addToast: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      state.toasts.push({ id, type: action.payload.type || 'info', message: action.payload.message });
    },
    removeToast: (state, action) => { state.toasts = state.toasts.filter(toast => toast.id !== action.payload); },
    setAdminHeader: (state, action) => { state.adminHeader = { title: action.payload.title, description: action.payload.description }; }
  },
});

export const { showBlockingLoader, hideBlockingLoader, showSubtleLoader, hideSubtleLoader, addToast, removeToast, setAdminHeader } = uiSlice.actions;
export default uiSlice.reducer;
