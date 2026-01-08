const historyEl = document.getElementById('history');
const maxItems = 4;
const history = [];

function categorize(text) {
  const trimmed = text.trim();
  const email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
  const url = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
  const hexColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

  if (hexColor.test(trimmed)) return { label: 'Color', css: 'color' };
  if (url.test(trimmed)) return { label: 'URL link', css: 'url' };
  if (email.test(trimmed)) return { label: 'Email', css: 'email' };
  return { label: 'Text', css: 'text' };
}

function render() {
  if (!history.length) {
    historyEl.innerHTML = '<div class="card"><div class="content">Copy something to start tracking.</div></div>';
    return;
  }

  historyEl.innerHTML = history
    .map((item, idx) => {
      const tag = categorize(item.text);
      return `<article class="card ${tag.css}" data-idx="${idx}">
        <div class="meta">
          <div class="tag ${tag.css}">${tag.label}</div>
        </div>
        <div class="content">${escapeHTML(item.text)}</div>
      </article>`;
    })
    .join('');
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function handleClipboard(payload) {
  if (!payload || !payload.text || !payload.text.trim()) return;
  if (history[0]?.text === payload.text) return;
  history.unshift(payload);
  history.splice(maxItems);
  render();
}

render();
if (window.clipboardAPI?.onChange) {
  window.clipboardAPI.onChange(handleClipboard);
} else {
  historyEl.innerHTML = '<div class="card"><div class="content">Clipboard bridge failed to load.</div></div>';
}

historyEl.addEventListener('click', async event => {
  const card = event.target.closest('.card');
  if (!card || !history.length) return;
  const idx = Number(card.dataset.idx);
  const item = history[idx];
  if (!item) return;

  document.querySelectorAll('.card').forEach(el => el.classList.remove('active'));
  card.classList.add('active');

  try {
    await window.clipboardAPI.writeText(item.text);
  } catch (err) {
    console.error('Failed to copy', err);
  }
});
