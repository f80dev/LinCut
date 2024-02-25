module.exports = {
  entry: {
    background: 'src/background.js',
    'content-script': 'src/content-script.ts',
  },
  optimization: {
    runtimeChunk: false,
  },
}
