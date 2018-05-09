import browser from 'webextension-polyfill';

const port = browser.runtime.connect({ name: 'content_script' });

document.addEventListener('input', ({ target }) => {
  const text = target.value || target.innerText;
  port.postMessage({ type: 'text', text });
});
