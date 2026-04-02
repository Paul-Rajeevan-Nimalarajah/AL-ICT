const fs = require('fs');
const path = require('path');

function getDirStructure(dir) {
  const result = {};
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      result[file] = getDirStructure(filePath);
    } else {
      if (!result._files) result._files = [];
      result._files.push(file);
    }
  });
  return result;
}

const baseDir = 'C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\website\\assets\\pdfs\\PastPaper';
const structure = getDirStructure(baseDir);
const outputPath = 'C:\\Users\\Paul-Rajeevan\\Desktop\\AL ICT Tamil Medium Notes Hub\\tmp\\past_papers_structure.json';
fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2));
console.log('Structure saved to ' + outputPath);
