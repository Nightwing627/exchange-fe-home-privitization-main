const path = require('path');
const fs = require('fs');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }
  configWillLoad(){
    const { app } = this;
    let argv = {};
    const serverConfigPath = path.join(__dirname, './serverConfig.json');
    try {
      argv = JSON.parse(process.argv[2]);
    } catch (e) {

    }

    if (argv.buildEnv) {
      app.config.buildEnv = argv.buildEnv;
    }
    // 远程拉取数据 存储地址
    if (app.config.env === 'local') {
      app.config.staticDir = './app/public';
    } else {
      app.config.staticDir = './../exchange-fe-server-static';
    }
    app.config.staticPath = path.join(__dirname, app.config.staticDir, 'serverData/');
    app.config.skinsPath = path.join(__dirname, app.config.staticDir, 'siknData/');
    app.config.localesPath = path.join(__dirname, 'app/view/src/locales');
    app.config.footerHeaderPath = path.join(__dirname, app.config.staticDir, 'footerHeader/');
    app.config.appDownLoadPath = path.join(__dirname, app.config.staticDir, 'appDownLoadPath/');
    app.config.bannerIndexPath = path.join(__dirname, app.config.staticDir, 'bannerIndex/');
    app.config.footerList = path.join(__dirname, app.config.staticDir, 'footerList/');
    if (!fs.existsSync(app.config.staticDir)) {
      fs.mkdirSync(app.config.staticDir);
    }
    if (fs.existsSync(serverConfigPath)) {
      const jsonData = JSON.parse(fs.readFileSync(serverConfigPath, 'utf8'));
      app.config.serverUrlConfig = jsonData;
    }

    // 域名配置文件
    let configDomainPath = path.join(app.config.staticPath, 'pageDomain.json');
    app.config.configDomain = {}
    if (fs.existsSync(configDomainPath)) {
      app.config.configDomain = JSON.parse(fs.readFileSync(configDomainPath, 'utf8'));
    }

    const staticDomainPath = path.join(app.config.staticPath, 'staticDomain.json');
    app.config.staticDomain = '';
    if(fs.existsSync(staticDomainPath)){
      app.config.staticDomain = JSON.parse(fs.readFileSync(staticDomainPath, 'utf8')).staticDomain;
    }
    const domainArrPath = path.join(app.config.staticPath, 'domainList.json');
    let domainArr = {};
    if (fs.existsSync(domainArrPath)) {
      domainArr = JSON.parse(fs.readFileSync(domainArrPath, 'utf8'));
    }
    app.config.domainArr = domainArr;
    app.config.defaultLocalePath = path.join(__dirname, 'app/view/src/locales');
  }
}

module.exports = AppBootHook;
