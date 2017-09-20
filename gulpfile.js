const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleancss = require('gulp-clean-css')
const uglify = require('gulp-uglify')
const sourcemaps = require('gulp-sourcemaps')
const size = require('gulp-size')
const eslint = require('gulp-eslint')
const babel = require('gulp-babel')
const fs = require('fs')
const rimraf = require('gulp-rimraf')

const path = {
  src: '_src/',
  sass: '_src/sass',
  css: 'assets/css',
  jsSrc: '_src/js',
  jsDest: 'assets/javascripts'
}

const sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
}

const cleancssOptions = {
  keepSpecialComments: 1,
  debug: true
}

const isScss = file => /.scss$/.test(file)
const isJs = file => /.js$/.test(file)

gulp.task('styles', () => {
  fs.readdir(path.sass, (err, files) => {
    if (err) throw err

    files.filter(isScss).map(file => {
      gulp.src(path.sass + '/' + file)
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
        .pipe(gulp.dest(path.css))
        .pipe(cleancss(cleancssOptions))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(gulp.dest(path.css))
    })
  })
})

gulp.task('styles-map', () => {
  fs.readdir(path.sass, (err, files) => {
    if (err) throw err

    files.filter(isScss).map(file => {
      gulp.src(path.sass + '/' + file)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.css))
        .pipe(sourcemaps.init())
        .pipe(cleancss(cleancssOptions))
        .pipe(sourcemaps.write())
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(gulp.dest(path.css))
    })
  })
})

gulp.task('scripts', function () {
  fs.readdir(path.jsSrc, function (err, files) {
    if (err) throw err

    files.filter(isJs).map(file => {
      gulp.src(path.jsSrc + '/' + file)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(babel({
          presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(path.jsDest))
    })
  })
})

gulp.task('scripts-map', function () {
  fs.readdir(path.jsSrc, function (err, files) {
    if (err) throw err

    files.forEach(function (file) {
      if (/.js/.test(file)) {
        return gulp.src(path.jsSrc + '/' + file)
          .pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failAfterError())
          .pipe(babel({
            presets: ['env']
          }))
          .pipe(sourcemaps.init())
          .pipe(uglify())
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(path.jsDest))
      }
    })
  })
})

gulp.task('build-vendor', ['build-clean'], function () {
  gulp.src('src/vendor/**/*.*')
    .pipe(gulp.dest('build/vendor/'))
})

gulp.task('build-clean', function () {
  gulp.src('build', { read: false })
    .pipe(rimraf())
})

gulp.task('default', function () {
  gulp.start(['styles', 'scripts'])
})

gulp.task('watch', function () {
  gulp.watch(path.sass + '/**/*.scss', ['styles'])
  gulp.watch(path.jsSrc + '/**/*.js', ['scripts'])
})
