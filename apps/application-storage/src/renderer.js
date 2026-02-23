const urlPanel = document.getElementById('url-panel');
const urlForm = document.getElementById('url-form');
const urlInput = document.getElementById('catalog-url');
const statusBox = document.getElementById('status-box');
const sourceLabel = document.getElementById('source-label');
const cardsRow = document.getElementById('applications-row');

initialize();

async function initialize() {
  const result = await window.applicationStorage.loadLocalApplications();
  applyResult(result);
}

urlForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const url = urlInput.value.trim();
  if (!url) {
    renderStatus('Enter a URL before loading.', 'warning');
    return;
  }

  renderStatus('Loading applications from URL...', 'info');

  const result = await window.applicationStorage.loadApplicationsFromUrl(url);
  applyResult(result);
});

function applyResult(result) {
  if (result.error) {
    cardsRow.innerHTML = '';
    sourceLabel.textContent = 'Unavailable';
    urlPanel.classList.remove('d-none');
    renderStatus(result.error, 'danger');
    return;
  }

  if (result.needsUrl) {
    cardsRow.innerHTML = '';
    sourceLabel.textContent = 'Not found';
    urlPanel.classList.remove('d-none');
    renderStatus(
      result.message || 'applications.json is missing. Provide a URL to a JSON catalog.',
      'warning'
    );
    return;
  }

  urlPanel.classList.add('d-none');
  sourceLabel.textContent = result.source || 'Unknown source';
  renderCards(result.applications || []);

  const total = result.applications ? result.applications.length : 0;
  renderStatus(`Loaded ${total} application${total === 1 ? '' : 's'}.`, 'success');
}

function renderCards(applications) {
  if (!Array.isArray(applications) || applications.length === 0) {
    cardsRow.innerHTML =
      '<div class="col-12"><div class="alert alert-secondary mb-0">No applications found.</div></div>';
    return;
  }

  cardsRow.innerHTML = applications.map(renderCard).join('');
}

function renderCard(application) {
  const title = escapeHtml(application.title || 'Untitled Application');
  const description = escapeHtml(application.description || '');
  const body = description
    ? `<p class="card-text text-muted mb-0">${description}</p>`
    : '<p class="card-text text-muted mb-0">No description provided.</p>';

  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card h-100 shadow-sm border-0">
        <div class="card-body">
          <h2 class="h5 card-title">${title}</h2>
          ${body}
        </div>
      </article>
    </div>
  `;
}

function renderStatus(message, level) {
  statusBox.className = `alert alert-${level} mb-0`;
  statusBox.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
