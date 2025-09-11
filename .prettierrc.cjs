module.exports = {
  // Configurações básicas
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // Configurações JSX
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Configurações de quebra de linha
  endOfLine: 'lf',
  
  // Configurações de arrays e objetos
  bracketSpacing: true,
  arrowParens: 'avoid',
  
  // Configurações específicas por tipo de arquivo
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.sql',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};