module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  importOrder: ['^[./]', '^@/(.*)$'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  plugins: ['@trivago/prettier-plugin-sort-imports'],
}
