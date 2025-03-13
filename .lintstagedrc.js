export default {
  '**/*.{js,jsx,ts,tsx,vue}': ['eslint --ext .js,.jsx,.ts,.tsx,.vue --fix', 'prettier --write'],
  '**/*.{css,scss,json}': ['prettier --write'],
}
