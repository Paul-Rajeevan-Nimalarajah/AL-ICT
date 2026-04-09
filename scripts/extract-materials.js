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
          // try to find closest title
          const cardTitle = $(el).closest('.pdf-card').find('.pdf-card-title').text().trim();
          // if title is just "Download Part I", make it more descriptive
          title = cardTitle ? `${cardTitle} - ${title.replace('Download ', '')}` : title;
      }
      links.push({ title, href });
    }
  });

  return links;
};

const main = () => {
  const dataDir = path.join(__dirname, '../website/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const materials = {
    notes: extractMaterials(path.join(__dirname, '../website/notes.html')),
    models: extractMaterials(path.join(__dirname, '../website/model-papers.html')),
    pastPapers: extractMaterials(path.join(__dirname, '../website/past-papers.html'))
  };

  fs.writeFileSync(
    path.join(dataDir, 'materials.json'),
    JSON.stringify(materials, null, 2)
  );
  
  console.log('Successfully extracted materials to website/data/materials.json');
};

main();
