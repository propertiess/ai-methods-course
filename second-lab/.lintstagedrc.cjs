module.exports = {
  '*.{js,jsx,ts,tsx}': ['pnpm lint', 'pnpm format'],
  '*.html': ['pnpm lint', 'pnpm format'],
  '*.{css,scss}': 'prettier --write'
};
