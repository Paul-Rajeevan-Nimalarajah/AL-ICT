const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\website\\assets\\pdfs\\PastPaper';
const structure = JSON.parse(fs.readFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_structure.json', 'utf8'));

const finalData = {};

for (const year in structure) {
  finalData[year] = {};
  for (const category in structure[year]) {
    const categoryPath = path.join(baseDir, year, category);
    const files = structure[year][category]._files || [];
    
    let pdfFile = files.find(f => f.endsWith('.pdf'));
    if (pdfFile) {
      finalData[year][category] = `assets/pdfs/PastPaper/${year}/${category}/${pdfFile}`;
    } else {
      const driveFile = files.find(f => f === 'pdf-drive-link.txt');
      if (driveFile) {
        const driveLink = fs.readFileSync(path.join(categoryPath, driveFile), 'utf8').trim();
        finalData[year][category] = driveLink;
      } else {
        finalData[year][category] = null;
      }
    }
  }
}

fs.writeFileSync('C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_final.json', JSON.stringify(finalData, null, 2));
console.log('Final data saved to tmp/past_papers_final.json');
