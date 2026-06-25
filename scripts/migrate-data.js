const fs = require('fs');
const path = require('path');
const vm = require('vm');

const indexPath = path.join(__dirname, '../index.html');
const dbPath = path.join(__dirname, '../db.json');

console.log('Starting data migration...');

if (!fs.existsSync(indexPath)) {
  console.error('Original index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');

// Find the COURSES array code block in index.html
const startMarker = 'const COURSES = [';
const startIndex = indexContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error('COURSES array not found in index.html!');
  process.exit(1);
}

// Find matching closing bracket for the COURSES array
let openBrackets = 1;
let index = startIndex + startMarker.length;
while (openBrackets > 0 && index < indexContent.length) {
  if (indexContent[index] === '[') openBrackets++;
  else if (indexContent[index] === ']') openBrackets--;
  index++;
}

const coursesCode = indexContent.substring(startIndex, index);

// In Node's VM, declaring variables with 'const' at top level does not bind them to the global context.
// We replace 'const COURSES =' with 'this.COURSES =' so it binds properly.
const executableCode = coursesCode.replace(/const\s+COURSES\s*=/, 'this.COURSES =');

// Execute extracted JS code safely using vm module
const context = {};
try {
  vm.createContext(context);
  vm.runInContext(executableCode, context);
} catch (err) {
  console.error('Error executing COURSES code:', err);
  process.exit(1);
}

const courses = context.COURSES;
if (!Array.isArray(courses)) {
  console.error('Failed to extract courses array! Context keys:', Object.keys(context));
  process.exit(1);
}

console.log(`Successfully extracted ${courses.length} courses.`);

// Default categories/sections matching index.html
const categories = [
  { id: 'foundation', nameAr: 'تأسيس', nameEn: 'Foundation' },
  { id: 'english', nameAr: 'English', nameEn: 'English' },
  { id: 'arabic', nameAr: 'عربي', nameEn: 'Arabic' },
  { id: 'languages', nameAr: 'لغات أخرى', nameEn: 'Other Languages' },
  { id: 'math', nameAr: 'رياضيات', nameEn: 'Math' },
  { id: 'science', nameAr: 'علوم', nameEn: 'Science' },
  { id: 'programming', nameAr: 'برمجة', nameEn: 'Programming' },
  { id: 'new', nameAr: 'كورسات جديدة', nameEn: 'New Courses' }
];

const dbData = {
  categories,
  courses
};

fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Migration completed successfully! Data written to: ${dbPath}`);
