export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  importOrder: ['^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
}
