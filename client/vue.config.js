module.exports = {
  indexPath: 'templates/index.html',
  assetsDir: 'assets',
  devServer: {
    // disableHostCheck: true,
    // hot: false,
    // liveReload: false
  },
  chainWebpack: config => {
    config.plugins.delete('hmr');
    config.module.rules.delete('eslint');
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@import "~@/assets/styles/_variables.scss";`
      }
    }
  }
};
