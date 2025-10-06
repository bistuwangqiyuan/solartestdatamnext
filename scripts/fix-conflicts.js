const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to fix
const files = [
  'lib/supabase.js',
  'pages/auth/login.jsx',
  'pages/auth/register.jsx',
  'pages/dashboard/index.jsx',
  'pages/data/batches/[id].jsx',
  'pages/data/index.jsx',
  'pages/import/index.jsx',
  'pages/reports/generate.jsx',
  'pages/reports/index.jsx',
  'pages/visualization/index.jsx',
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove conflict markers and keep the HEAD version (simpler version)
  const lines = content.split('\n');
  const cleanedLines = [];
  let inConflict = false;
  let keepLines = true;
  
  for (let line of lines) {
    if (line.startsWith('<<<<<<<')) {
      inConflict = true;
      keepLines = true;
      continue;
    }
    if (line.startsWith('=======')) {
      keepLines = false;
      continue;
    }
    if (line.startsWith('>>>>>>>')) {
      inConflict = false;
      keepLines = true;
      continue;
    }
    
    if (!inConflict || keepLines) {
      cleanedLines.push(line);
    }
  }
  
  fs.writeFileSync(filePath, cleanedLines.join('\n'));
  console.log(`✅ Fixed: ${file}`);
});

console.log('\n✅ All conflicts fixed!');
