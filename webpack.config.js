// 引入path包
const path = require('path');

module.exports = {
  // 指定入口文件
  entry: './src/main.ts',
  mode: 'development',
  // 指定打包文件所在目录
  output: {
    path: path.resolve(__dirname, 'dist'),
    // 打包后文件的名称
    filename: 'bundle.js',
  },

  // 指定webpack打包的时候要使用的模块
  module: {
    // 指定要加载的规则
    rules: [
      {
        // test指定的是规则生效的文件，意思是，用ts-loader来处理以ts为结尾的文件
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
