const ProxyAgent = require('proxy-agent')

// const getIp = () => {
//   var interfaces = require('os').networkInterfaces()
//   for (var devName in interfaces) {
//     var iface = interfaces[devName]
//     for (var i = 0; i < iface.length; i++) {
//       var alias = iface[i]
//       if (
//         alias.family === 'IPv4' &&
//         alias.address !== '127.0.0.1' &&
//         !alias.internal
//       ) {
//         return alias.address
//       }
//     }
//   }
// }
module.exports = {
  // 选项...
  outputDir: 'build',

  assetsDir: 'static',

  productionSourceMap: false,

  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')

    if (process.env.NODE_ENV === 'production') {
      config.plugin('html').tap((args) => {
        Object.assign(args[0].minify, {
          minifyJS: true,
          minifyCSS: true,
        })
        return args
      })
    }
  },
  devServer: {
    open: true,
    https: true,
    proxy: {
      '/api': {
        target: 'https://saas.nucleex.com/',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
        agent: new ProxyAgent('http://10.3.12.91:1196'),
        headers: {
          'x-forwarded-host': 'saas.nucleex.com',
        },
      },
    },
  },

  lintOnSave: undefined,
}
