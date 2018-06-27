
// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var less   = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var reload      = browserSync.reload;
var minifyHTML = require('gulp-minify-html');
var merge = require('merge-stream');

gulp.task('less', function () {
    gulp.src('./application/resources/less/main.less')
        .pipe(less())
        .on('error', function () {
            this.emit('end');
        })
        .pipe(rename('app.css'))
        .pipe(gulp.dest('./assets/css'));

    gulp.src([       
        //angular material
        'application/resources/angular-material/core/core.css',
        'application/resources/angular-material/autocomplete/autocomplete.css',
        'application/resources/angular-material/dialog/dialog.css',
        'application/resources/angular-material/backdrop/backdrop.css',
        'application/resources/angular-material/button/button.css',
        'application/resources/angular-material/checkbox/checkbox.css',
        'application/resources/angular-material/icon/icon.css',
        'application/resources/angular-material/input/input.css',
        'application/resources/angular-material/progressCircular/progressCircular.css',
        'application/resources/angular-material/progressLinear/progressLinear.css',
        'application/resources/angular-material/select/select.css',
        'application/resources/angular-material/toast/toast.css', 

        //main css
        './assets/css/app.css',
    ])
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('./assets/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('html.modals', function() {
    gulp.src('assets/views/modals/*.html')
        .pipe(concat('modals.html'))
        .pipe(minifyHTML())
        .pipe(gulp.dest('assets/views'));
});

gulp.task('scripts.core', function() {
    return gulp.src([
        'application/resources/js/vendor/jquery.js',
        'application/resources/js/vendor/moment.js',
        'application/resources/js/vendor/bootstrap.js',
        'application/resources/js/vendor/jquery-ui.js',
        'application/resources/js/vendor/hammer.js',
        'application/resources/js/vendor/angular.min.js',
        'application/resources/js/vendor/angular-animate.js',
        'application/resources/js/vendor/angular-aria.js',

        //angular material
        'application/resources/angular-material/core/core.js',
        'application/resources/angular-material/autocomplete/autocomplete.js',
        'application/resources/angular-material/dialog/dialog.js',
        'application/resources/angular-material/backdrop/backdrop.js',
        'application/resources/angular-material/button/button.js',
        'application/resources/angular-material/checkbox/checkbox.js',
        'application/resources/angular-material/icon/icon.js',
        'application/resources/angular-material/input/input.js',
        'application/resources/angular-material/progressCircular/progressCircular.js',
        'application/resources/angular-material/progressLinear/progressLinear.js',
        'application/resources/angular-material/select/select.js',
        'application/resources/angular-material/toast/toast.js',  

        'application/resources/js/vendor/angular-upload.js',
        'application/resources/js/vendor/angular-messages.js',
        'application/resources/js/vendor/angular-lazy-image-load.js',
        'application/resources/js/vendor/angular-ui-router.js',
        'application/resources/js/vendor/angular-translate.js',
        'application/resources/js/vendor/angular-translate-url-loader.js',
        'application/resources/js/vendor/angular-pagination.js',
        'application/resources/js/vendor/angular-tags.js',
        'application/resources/js/vendor/filesize.js',
        'application/resources/js/core/App.js',
        'application/resources/js/core/Routes.js',
        'application/resources/js/core/LocalStorage.js',
        'application/resources/js/core/**/*.js',

        'application/resources/js/vendor/jquery.jplayer.js',
        'application/resources/js/dashboard/**/**.js',

        'application/resources/js/vendor/pagination.js',
        'application/resources/js/admin/**/*.js',

        'application/resources/js/vendor/chart.js',
        'application/resources/js/analytics/PromisePolyfill.js',
    ])
    .pipe(concat('core.min.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(browserSync.reload({stream:true}));
});


gulp.task('minify', function() {
    gulp.src('assets/js/core.min.js').pipe(uglify()).pipe(gulp.dest('assets/js'));

    gulp.src('assets/css/styles.min.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false
        }))
        .pipe(minifyCSS({compatibility: 'ie10'}))
        .pipe(gulp.dest('assets/css'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    browserSync({
        proxy: "http://localhost/drive"
    });

    gulp.watch('application/resources/js/**/*.js', ['scripts.core']);
    gulp.watch('application/resources/less/**/*.less', ['less']);
    gulp.watch('assets/views/**', ['html.modals']).on('change', reload);
});

// Default Task
gulp.task('default', ['watch']);