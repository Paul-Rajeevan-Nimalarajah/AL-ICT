const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_final.json', 'utf8'));

let html = '<div class="grid grid-cols-1 gap-6 max-w-3xl mx-auto">';
const years = Object.keys(data).sort((a, b) => b - a);

years.forEach(year => {
  const paperUrl = data[year]['Past Paper'];
  const markingUrl = data[year]['Marking Scheme'] || '#';
  
  html += `
      <!-- ${year} A/L ICT Past Paper Archive -->
      <article class="pdf-card">
        <div class="flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <div style="background: var(--gradient-primary); color: white; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-display); font-size: 1.1rem; flex-shrink: 0;">
              ${year}
            </div>
            <div>
              <h3 class="pdf-card-title">${year} G.C.E. A/L ICT</h3>
              <p class="pdf-card-desc" style="margin-bottom: 0;">Examination Material (Tamil Medium)</p>
            </div>
          </div>
          
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
              <span class="pdf-meta-label">1. Examination Paper</span>
              <a href="${paperUrl}" class="pdf-card-download" target="_blank" rel="noopener noreferrer" style="width: 100%; justify-content: center;">
                <i class="fa-solid fa-file-pdf"></i> Download Past Paper (${year})
              </a>
            </div>

            <div class="flex flex-col gap-2">
              <span class="pdf-meta-label">2. Official Marking Scheme</span>
              <a href="${markingUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer" style="width: 100%; justify-content: center; border-color: var(--secondary); color: var(--secondary);">
                <i class="fa-solid fa-file-circle-check"></i> Download Marking Scheme (${year})
              </a>
            </div>
          </div>
        </div>
      </article>
  `;
});

html += '</div>';

fs.writeFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_snippet_v3.html', html);
console.log('HTML v3 (Single Column) snippet generated in tmp/past_papers_snippet_v3.html');
