const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_final.json', 'utf8'));

let html = '';
const years = Object.keys(data).sort((a, b) => b - a);

years.forEach(year => {
  const paperUrl = data[year]['Past Paper'];
  const markingUrl = data[year]['Marking Scheme'];
  const targetId = `marking-${year}`;

  html += `
      <!-- ${year} A/L ICT Past Paper -->
      <article class="pdf-card">
        <div class="pdf-card-header">
          <div class="flex flex-col gap-1">
            <h3 class="pdf-card-title">${year} A/L ICT Past Paper</h3>
            <p class="pdf-card-desc">Advanced Level ICT ${year} Official Examination Paper (Tamil Medium).</p>
          </div>
          <div class="pdf-card-actions">
            <a href="${paperUrl}" class="pdf-card-download" target="_blank" rel="noopener noreferrer">
              <i class="fa-solid fa-download"></i> Download Paper
            </a>
            <button class="pdf-toggle-btn" data-target="${targetId}" aria-expanded="false" aria-label="Show marking scheme">
              <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </button>
          </div>
        </div>
        
        <div id="${targetId}" class="pdf-card-body">
          <div class="pdf-meta-grid">
            <div class="pdf-meta-item">
              <span class="pdf-meta-label">Type</span>
              <span class="pdf-meta-value">Marking Scheme</span>
            </div>
            <div class="pdf-meta-item">
              <span class="pdf-meta-label">Medium</span>
              <span class="pdf-meta-value">Tamil</span>
            </div>
          </div>
          <a href="${markingUrl}" class="btn btn-secondary w-full" style="width: 100%;" target="_blank" rel="noopener noreferrer">
            <i class="fa-solid fa-file-circle-check"></i> Download Marking Scheme
          </a>
        </div>
      </article>
  `;
});

fs.writeFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_snippet.html', html);
console.log('HTML snippet generated in tmp/past_papers_snippet.html');
