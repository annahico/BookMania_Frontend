import '@testing-library/jest-dom';
import i18n from '../i18n';

// jsdom's navigator.language defaults to "en-US" — without pinning this,
// LanguageDetector would pick English (there's nothing in localStorage yet)
// and every existing Spanish-text assertion in the test suite would break.
i18n.changeLanguage('es');

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
