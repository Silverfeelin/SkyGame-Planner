import clipboardy from 'clipboardy';

// Example fileNames array, replace with your actual data or import from another module
const fileNames = [
  '/assets/game/dyes/hair/2slots_Assembly_march.jpg',
  '/assets/game/dyes/hair/2slots_Assembly_ultpot.jpg'
];

const formatted = `const fileNames = [\n  '${fileNames.join("',\n  '")}']`;
clipboardy.writeSync(formatted);
console.log('Copied to clipboard!');
