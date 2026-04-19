const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const extractMaterials = (filePath) => {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const links = [];

  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && (href.includes('drive.google.com') || href.includes('pdfs/'))) {
      let title = $(el).text().trim();
      if (!title || title.includes('Download') || title.includes('Part')) {
          const cardTitle = $(el).closest('.pdf-card').find('.pdf-card-title').text().trim();
          title = cardTitle ? `${cardTitle} - ${title.replace('Download ', '')}` : title;
      }

      // Determine category (Unit or Year) from section title or link title
      let group = 'Other';
      const sectionHeader = $(el).closest('article.card').find('h2').first().text().trim();
      
      const yearMatch = title.match(/(20\d{2})/) || sectionHeader.match(/(20\d{2})/);
      const unitMatch = title.match(/Unit\s*(\d+)/i) || sectionHeader.match(/Unit\s*(\d+)/i);
      
      if (unitMatch) {
          group = `Unit ${unitMatch[1]}`;
      } else if (yearMatch) {
          group = yearMatch[1];
      } else if (sectionHeader.toLowerCase().includes('e-kalvi') || title.toLowerCase().includes('e-kalvi')) {
          group = 'e-Kalvi';
      } else if (sectionHeader) {
          group = sectionHeader.split('–')[0].split('-')[0].trim(); // Extract first part of header
      }

      links.push({ title, href, group });
    }
  });

  return links;
};

const main = () => {
  const dataDir = path.join(__dirname, '../website/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const notes = extractMaterials(path.join(__dirname, '../website/notes.html'));
  const models = extractMaterials(path.join(__dirname, '../website/model-papers.html'));
  const pastPapers = extractMaterials(path.join(__dirname, '../website/past-papers.html'));

  const materials = {
    notesGroups: [...new Set(notes.map(n => n.group))].sort(),
    modelsGroups: [...new Set(models.map(m => m.group))].sort().reverse(),
    pastPapersGroups: [...new Set(pastPapers.map(p => p.group))].sort().reverse(),
    notes,
    models,
    pastPapers
  };

  fs.writeFileSync(
    path.join(dataDir, 'materials.json'),
    JSON.stringify(materials, null, 2)
  );
  
  console.log('Successfully extracted grouped materials to website/data/materials.json');
};

main();
