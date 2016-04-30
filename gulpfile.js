'use strict'
const gulp          = require('gulp')
const nodemon       = require('gulp-nodemon')
const plumber       = require('gulp-plumber')
const webpack       = require('webpack-stream')

gulp.task('default', ['server', 'webpack'])

gulp.task('server', () => {
  nodemon({
    script: 'server/server.js',
    watch: './server',
    ext: 'js',
    ignore: []
  })
})

gulp.task('webpack', () => {
  return gulp.src('client/main.js')
    .pipe(plumber())
    .pipe(webpack({
      watch: true,
      devtool: 'source-map',
      output: { filename: 'bundle.js' },
      module: {
        loaders: [
          {
            test: /.js?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['es2015', 'react']
            }
          }
        ]
      }
    }))
    .pipe(gulp.dest('public'))
})
