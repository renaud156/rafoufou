const STORAGE_KEY = 'ti_cart_v2';
const STORAGE_KEY = 'ti_cart_v1';

const clone = (value) => JSON.parse(JSON.stringify(value));

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn('LocalStorage indisponible', error);
  }
  return null;
};

const storage = getStorage();

const sanitizeMeta = (meta) => {
  if (!meta || typeof meta !== 'object') return {};
  const copy = { ...meta };
  if ('key' in copy) copy.key = String(copy.key);
  if ('uid' in copy) copy.uid = String(copy.uid);
  return copy;
};

const initialState = () => {
  if (!storage) {
    return { items: [] };
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return {
        items: parsed.items
          .filter((item) => item && item.uid && item.id && item.title && typeof item.price === 'number' && item.date)
          .map((item) => ({
            uid: String(item.uid),
            id: String(item.id),
            title: String(item.title),
            date: String(item.date),
            price: Number(item.price),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
            meta: sanitizeMeta(item.meta),
          })),
      };
    }
  } catch (error) {
    console.warn('Impossible de lire le panier', error);
  }
  return { items: [] };
};

let state = initialState();
const listeners = new Set();

const persist = () => {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Impossible de sauvegarder le panier', error);
  }
};

const emit = (detail) => {
  const snapshot = clone(state);
  listeners.forEach((listener) => {
    try {
      listener(snapshot, detail);
    } catch (error) {
      console.error('Cart listener error', error);
    }
  });
};

const getState = () => clone(state);

const addItem = ({ id, title, price, date, meta }) => {
  if (!id || !title || !date || typeof price !== 'number') return state;
  const metadata = sanitizeMeta(meta);
  const key = metadata.key || metadata.uid || date;
  const uid = `${id}__${key}`;
  metadata.key = key;
  metadata.uid = uid;
  const existing = state.items.find((item) => item.uid === uid);
  if (existing) {
    existing.quantity += 1;
    existing.meta = metadata;
  } else {
    state.items.push({ uid, id, title, price, date, quantity: 1, meta: metadata });
  }
  persist();
  emit({ type: 'add', uid });
  return getState();
};

const updateQuantity = (uid, quantity) => {
  const item = state.items.find((entry) => entry.uid === uid);
  if (!item) return state;
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  item.quantity = nextQuantity;
  persist();
  emit({ type: 'update', uid });
  return getState();
};

const decrement = (uid) => {
  const item = state.items.find((entry) => entry.uid === uid);
  if (!item) return state;
  if (item.quantity > 1) {
    item.quantity -= 1;
    persist();
    emit({ type: 'update', uid });
  } else {
    removeItem(uid);
  }
  return getState();
};

const removeItem = (uid) => {
  const nextItems = state.items.filter((item) => item.uid !== uid);
  if (nextItems.length === state.items.length) return state;
  state.items = nextItems;
  persist();
  emit({ type: 'remove', uid });
  return getState();
};

const clear = () => {
  if (!state.items.length) return state;
  state = { items: [] };
  persist();
  emit({ type: 'clear' });
  return getState();
};

const subscribe = (callback) => {
  if (typeof callback !== 'function') return () => {};
  listeners.add(callback);
  callback(getState(), { type: 'init' });
  return () => listeners.delete(callback);
};

export const cart = {
  addItem,
  removeItem,
  decrement,
  updateQuantity,
  clear,
  getState,
  subscribe,
};

export default cart;
