// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    ['taro',
      {
        framework: 'react',
        ts: 'true',
        compiler: 'webpack5',
      }]
  ],
  plugins: [
    [
      "import",
      {
        "libraryName": "@antmjs/vantui",
        "libraryDirectory": "es",
        "style": true // 自动引入样式
      },
      "@antmjs/vantui"
    ],
  ]
}
