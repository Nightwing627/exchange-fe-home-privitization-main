const {
  src, task, dest, series, parallel,
} = require('gulp');
const path = require('path');
const camelCase = require('camelcase');
const browserify = require('browserify');
const fs = require('fs');
const copy = require('gulp-copy');
const babelify = require('babelify');
const stream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const watch = require('gulp-watch');
const crypto = require('crypto');
const rev = require('gulp-rev');
const uglify = require('gulp-uglify');
const through = require('through2');
const stylus = require('gulp-stylus');
const {transform} = require('babel-core');
const minify = require('html-minifier').minify;
const cleanCSS = require('gulp-clean-css');
const cp = require('child_process');
const rimraf = require('rimraf');
const websocketPath = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/websocket');
const webWorkerPath = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/web-worker');
const webWorkerMapPath = path.join(__dirname, 'app/view/src/assets/js/webworker-map.js');
const webWorkerIntoPath = path.join(__dirname, 'app/dist/home/static/web-worker');
const staticPath = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/static');
const staticIntoPath =  path.join(__dirname, 'app/dist/home/static/');
const imgPath = path.join(__dirname, 'app/view/imgTheme/1');
const imgInPath = path.join(__dirname, 'app/dist/home/static/img');
const { dirExists } = require('@knoxexchange/blockchain-ui-privatization/node/utils');
const sourceMapPath = path.join(__dirname, 'app/view/src/utils/imgMap.json');
const iconFontPath = path.join(__dirname, 'app/view/iconTheme/1.js');
const modulesJSPath = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/home/modules');
const templateConfig = require('./templateConfig');
const sourceMap = {};
const webWorkerMap = {};
const styleMap = {};
Object.keys(templateConfig).forEach((item) => {
  styleMap[item] = [];
});

let env = '';
try{
  env = process.argv[3].split('=')[1];
}catch (e) {

}

let staticDomain = '';
try{
  // let domain = JSON.parse(process.env.npm_config_argv).remain[0].split('=')[1];
  // staticDomain = domain;
}catch (e) {

}

let gitVersion = '';
try {
  const gitHead = fs.readFileSync('.git/HEAD', 'utf-8').trim();
  // eslint-disable-next-line prefer-destructuring
  gitVersion = gitHead.split('/')[2];
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('no git version');
}

if (!gitVersion) {
  try {
    gitVersion = cp.execSync(lastTagCommand, { cwd: '.' }).toString().replace(/\s/g, '');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('no git tag');
  }
}

async function mkdir(){
  if(!fs.existsSync(path.join(__dirname, 'app/dist'))){
    fs.mkdirSync(path.join(__dirname, 'app/dist'));
  }
  if(!fs.existsSync(path.join(__dirname, 'app/dist/home'))){
    fs.mkdirSync(path.join(__dirname, 'app/dist/home'));
  }

  if(!fs.existsSync(path.join(__dirname, 'app/dist/home/static'))){
    fs.mkdirSync(path.join(__dirname, 'app/dist/home/static'));
  }
  if(!fs.existsSync(path.join(__dirname, 'app/build'))){
    fs.mkdirSync(path.join(__dirname, 'app/build'));
  }
  if(!fs.existsSync(path.join(__dirname, 'app/build/template'))){
    fs.mkdirSync(path.join(__dirname, 'app/build/template'));
  }
}

async function clean(){
  rimraf.sync(path.join(__dirname, 'app/dist'));
}

async function css() {
  const cssPath = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/static/css/common.styl');
  src(cssPath)
    .pipe(stylus({}))
    .pipe(cleanCSS())
    .pipe(rev())
    .pipe(slove())
    .pipe(dest(path.join(__dirname, 'app/dist/home/static')));

}

const pages = path.join(__dirname, '/app/view/template/**');
const modules = path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/home/modules/*.js');

const watchFile = () => watch([pages, modules, path.join(__dirname, 'node_modules/@knoxexchange/blockchain-ui-privatization/websocket/**')],
  {}, series(buildModulesJS, buildTemplate, compassWebsocket));

function slove() {
  return through.obj((file, enc, cb) => {
    const fileName = file.relative;
    let contents = file.contents.toString(enc || 'utf-8').replace(/[.]{2}/g, '/home/static');
    let manifest = {};
    try {
      manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
    } catch (e) {

    }
    manifest[fileName.replace(`-${file.revHash}`, '')] = fileName;
    fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
    file.contents = Buffer.from(contents);
    cb(null, file);
  });
}

function compassFiles(paths, templatePath, outputPath, style) {
  paths.forEach((item) => {
    const intoPath = path.join(outputPath, item);
    const filePath = path.join(templatePath, item);
    if (fs.statSync(filePath).isDirectory()) {
      if (!fs.existsSync(intoPath)) {
        fs.mkdirSync(intoPath);
      }
      const dirs = fs.readdirSync(filePath);
      compassFiles(dirs, filePath, intoPath, style);
    } else {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (item.indexOf('index') === -1) {
        const scriptStart = content.indexOf('<script>') + 8;
        const scriptEnd = content.indexOf('</script>');
        const scriptContent = content.substring(scriptStart, scriptEnd);
/*        const styleStart = content.indexOf('<style>') + 7;
        const styletEnd = content.indexOf('</style>');
        const styletContent = content.substring(styleStart, styletEnd);
        const miniCss = minify(styletContent, {removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
        styleMap.china.push(miniCss);
        content = content.replace(styletContent, '');*/
        content = content.replace(scriptContent, transform(scriptContent, {
          minified: true,
          comments: false,
        }).code);
        content = minify(content, {
          minifyCSS: true,
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          html5: true,
          processConditionalComments: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
          trimCustomFragments: true,
          useShortDoctype: true,
        });
      }else{
        const JSPath = path.join(__dirname, './node_modules/@knoxexchange/blockchain-ui-privatization/static/js/html-init.js');
        const inlineJs = fs.readFileSync(JSPath, 'utf-8');
        const utilsJS = fs.readFileSync(path.join(__dirname, './node_modules/@knoxexchange/blockchain-ui-privatization/lib/utils.js'), 'utf-8');
        const fetchData = fs.readFileSync(path.join(__dirname, './node_modules/@knoxexchange/blockchain-ui-privatization/home/fetchData.js'), 'utf-8');
        const script = transform((inlineJs + utilsJS + fetchData), {
          minified: true,
          comments: false,
        }).code;
        content = content.replace('<script inline-html></script>', `<script>window.evn = "${process.env.NODE_ENV}";window.sysVersion = "${gitVersion}";window.updateDate="${new Date()}"; ${script}</script>`);
      }
      fs.writeFileSync(intoPath, content);
    }
  });
}

async function buildTemplate() {
  const templatePath = path.join(__dirname, 'app/view/template');
  const outputPath = path.join(__dirname, 'app/build/template');
  const dirs = fs.readdirSync(templatePath);
  compassFiles(dirs, templatePath, outputPath);
};

function createwebWrokerMap(dirPath, outPath) {
  const files = fs.readdirSync(dirPath);
  files.forEach((value) => {
    const filePath = path.join(dirPath, value);
    const intoPath = path.join(outPath, value);
    if (fs.statSync(filePath).isDirectory()) {
      if (!fs.existsSync(intoPath)) {
        fs.mkdirSync(intoPath);
      }
      createwebWrokerMap(filePath, intoPath);
    } else {
      const fileSource = fs.readFileSync(filePath, 'UTF-8');
      const md5sum = crypto.createHash('md5');
      const compassFileSource = transform(fileSource, {
        minified: true,
        comments: false,
        presets: ['env'],
        plugins: ["transform-remove-strict-mode"],
      }).code;
      md5sum.update(compassFileSource);
      const md5 = md5sum.digest('hex');
      const hashValue = `${md5}-${value}`;
      webWorkerMap[value.replace('.js', '')] = hashValue;
      fs.writeFileSync(intoPath.replace(value, hashValue), compassFileSource);
    }
  });
}

function createWebSocket(dirPath, outPath){
  let str = '';
  let manifest = {};
  const websocketPath = path.join(dirPath, '/websocket.js');
  const imgKeys = 'websocket-work.js'.split('.');
  const suffix = imgKeys[1];
  const imgKey = imgKeys[0];
  let name = imgKey;
  try {
    manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
  } catch (e) {

  }
  fs.readdirSync(path.join(dirPath, '/modules')).forEach((filePath) => {
    str += fs.readFileSync(path.join(dirPath, '/modules', filePath), 'utf-8');
  });
  str += fs.readFileSync(websocketPath, 'utf-8');
  if (process.env.NODE_ENV !== 'development'){
    str = transform(str, {
      minified: true,
      comments: false,
      presets: ['env'],
      plugins: ["transform-remove-strict-mode"],
    }).code;
    const md5sum = crypto.createHash('md5');
    md5sum.update(str);
    const md5 = md5sum.digest('hex');
    name = `${md5}-websocket`;
  }
  str = `(() => {${str}})()`;
  manifest[imgKey] = `/home/static/${name}.${suffix}`;
  fs.writeFileSync(path.join(outPath, `${name}.${suffix}`), str);
  fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
}

async function compassWebWorker (){
  if(!fs.existsSync(webWorkerIntoPath)){
    fs.mkdirSync(webWorkerIntoPath);
  }
  createwebWrokerMap(webWorkerPath, webWorkerIntoPath);
  fs.writeFileSync(webWorkerMapPath, `module.exports = ${JSON.stringify(webWorkerMap)}`);
};

async function compassWebsocket(){
  createWebSocket(websocketPath, staticIntoPath);
}



async function copyStatic(){
  fs.readdirSync(staticPath).forEach((dir) => {
    if (dir === 'js' || dir === 'fonts'){
      const dirPath = path.join(staticPath, dir)
      const dirInto = path.join(staticIntoPath, dir);
      if (!fs.existsSync(dirInto)){
        fs.mkdirSync(dirInto);
      }
      fs.readdirSync(dirPath).forEach((fileName) => {
        const fileInto = path.join(dirInto, fileName);
        const content = fs.readFileSync(path.join(dirPath, fileName));
        fs.writeFileSync(fileInto, content);
      });
    }
  });
};

function comassImg(imgPath, intoPath){
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
  } catch (e) {

  }
  const files = fs.readdirSync(imgPath);
  files.forEach((item) => {
    const imgKeys = item.split('.');
    const suffix = imgKeys[1];
    const imgKey = imgKeys[0];
    const source = fs.readFileSync(path.join(imgPath, item));
    const md5sum = crypto.createHash('md5');
    md5sum.update(source);
    const md5 = md5sum.digest('hex');
    manifest[imgKey] = `/home/static/img/${md5}.${suffix}`;
    fs.writeFileSync(path.join(intoPath, `${md5}.${suffix}`), source);
  });
  fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
}

async function copyImg(){
  if(!fs.existsSync(imgInPath)){
    fs.mkdirSync(imgInPath);
  }
  comassImg(imgPath, imgInPath);
}

async function iconJS(){
  if(!fs.existsSync(staticIntoPath)){
    fs.mkdirSync(staticIntoPath);
  }
  const source = fs.readFileSync(iconFontPath, 'utf-8');
  const md5sum = crypto.createHash('md5');
  md5sum.update(source);
  const md5 = md5sum.digest('hex');
  const hashValue = `${md5}-iconfont.js`;

  fs.writeFileSync(path.join(staticIntoPath, hashValue), source);
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
  } catch (e) {

  }
  manifest['iconfont'] = hashValue;
  fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
}

async function buildModulesJS(){
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
  } catch (e) {

  }
  fs.readdirSync(modulesJSPath).forEach((item) => {
    let source = fs.readFileSync(path.join(modulesJSPath, item), 'utf-8');
    const imgKeys = item.split('.');
    const imgKey = imgKeys[0];
    let name = item;
    if (process.env.NODE_ENV !== 'development'){
      source = transform(source, {
        minified: true,
        comments: false,
        presets: ['env'],
        plugins: ["transform-remove-strict-mode"],
      }).code;
      const md5sum = crypto.createHash('md5');
      md5sum.update(source);
      const md5 = md5sum.digest('hex');
      const hashValue = `${md5}-${item}`;
      manifest[imgKey] = hashValue;
      name = hashValue;
    }
    manifest[imgKey] = name;
    fs.writeFileSync(path.join(staticIntoPath, name), source);
  });
  fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
}

async function mkStaticDomain(){
  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(sourceMapPath), 'utf-8');
  } catch (e) {

  }
  if (!staticDomain){
    manifest.staticDomain = '';
  }else{
    manifest.staticDomain = staticDomain;
  }


  fs.writeFileSync(sourceMapPath, JSON.stringify(manifest));
}

/*exports.dev = parallel(js, watchFile);

exports.build = parallel('clean', buildJS);*/

exports.test = series(copyStatic);
exports.dev = series(mkdir, mkStaticDomain, buildModulesJS, compassWebsocket, iconJS, copyImg, buildTemplate, copyStatic, css, watchFile);
exports.build = series(clean, mkdir, mkStaticDomain, buildModulesJS, compassWebsocket, iconJS, copyImg, buildTemplate, copyStatic, css);
