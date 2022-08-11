'use strict';
const { Controller } = require('egg');
const fs = require('fs');
const path = require('path');
const { getLocale, getFileName, getPublicInfo, compare } = require('@knoxexchange/blockchain-ui-privatization/node/utils');
const { hostFilter } = require('@knoxexchange/blockchain-ui-privatization/node/utils');
const templateConfig = require('../utils/template-config');

class StaticIndex extends Controller {
  async index(ctx) {
    const currenLan = this.ctx.request.path.split('/')[1];
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    let nowHost = this.ctx.request.header.host;
    if (this.config.env === 'local') {
      nowHost = this.config.devUrlProxy.ex;
    }
    const cusSkin = ctx.cookies.get('cusSkin', {
      signed: false,
    });
    const { domainArr } = this.config;
    const fileName = getFileName(this);
    if (!domainArr[fileName]) {
      domainArr[fileName] = {
        fileName,
        domainName: `${ctx.app.httpclient.agent.protocol}//${nowHost}`,
      };
    }
    this.publicInfo = getPublicInfo(this, currenLan, cusSkin, nowHost);
    this.setLan(nowHost.replace(new RegExp(`^${nowHost.split('.')[0]}.`), ''));
    if (!fs.existsSync(path.join(this.config.staticPath, `${currenLan}-${fileName}.json`))) {
      await ctx.service.publictInfo.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan);
      await ctx.service.getFooterHeader.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan);
      await ctx.service.getAppDownLoad.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan);
      await ctx.service.getBannerIndex.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan);
      await ctx.service.getFooterList.getdataSync(domainArr[fileName], ctx.request.header.host, currenLan);
      this.publicInfo = getPublicInfo(this, currenLan, cusSkin, nowHost);
    } else {
      ctx.service.publictInfo.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
      ctx.service.getFooterHeader.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
      ctx.service.getAppDownLoad.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
      ctx.service.getBannerIndex.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
      ctx.service.getFooterList.getdata(domainArr[fileName], ctx.request.header.host, currenLan);
    }
    if (!reg.test(currenLan)) {
      return;
    }
    const fileBasePath = this.config.localesPath;
    const { noticeInfoList, cmsAdvertList, footer_warm_prompt, index_international_title1, index_international_title2 } = this.getLocalData(fileName, this.config.bannerIndexPath, currenLan);
    this.skin = this.getSkin(fileName, this.config.skinsPath);
    const footerList = this.getLocalData(fileName, this.config.footerList, currenLan);
    this.locale = getLocale(currenLan, fileName, fileBasePath, this.logger, this.app);
    const { msg, lan, market, symbolAll } = this.publicInfo;
    const headerFooter = this.getLocalData(fileName, this.config.footerHeaderPath, currenLan);
    let customHeaderList = {};
    if (headerFooter && headerFooter.header) {
      try {
        customHeaderList = JSON.parse(headerFooter.header);
      } catch (e) {
        this.logger.error('自定义header不是json');
      }
    }
    this.getSelectSkin();
    this.headerLink = this.getHeaderLink();
    await ctx.render('./index.njk', {
      env: this.config.env,
      locale: this.locale,
      msg,
      headerLink: this.headerLink,
      headerList: this.getHeaderList(),
      customHeaderList,
      headerSymbol: market ? market.headerSymbol : [],
      appDownLoad: this.getLocalData(fileName, this.config.appDownLoadPath, currenLan),
      lanList: lan ? lan.lanList : [],
      lan,
      seo: this.getSEO(),
      templateModule: this.getTemplate(),
      coinList: market ? market.coinList : [],
      switch: this.publicInfo.switch,
      assetsList: this.assetsList(),
      orderList: this.orderList(),
      number: item => Number(item),
      colorList: this.getColorList(currenLan),
      noticeList: this.getNoticeList(noticeInfoList),
      cmsAdvertList,
      symbolAll,
      footer_warm_prompt,
      footerList,
      imgMap: this.getImgMap(),
      footerTemplate: headerFooter.footer,
      sourceMap: this.getSourceMap(),
      skin: this.getSelectSkin(),
      internationalTitle: {
        title: index_international_title1,
        subTitle: index_international_title2,
      },
    });
  }

  getSEO() {
    const seo = this.publicInfo.seo || {};
    return {
      keywords: seo.keywords || '',
      description: seo.description || '',
      pageContent: seo.pageContent || '',
      title: seo.title || '',
    };
  }

  getTemplate() {
    let template = 'international';
    if (this.publicInfo.switch) {
      template = templateConfig[this.publicInfo.switch.index_temp_type];
    }
    return `modules/${template}.njk`;
  }

  getSelectSkin() {
    if (!this.skin) {
      return null;
    }
    const id = this.ctx.cookies.get('cusSkin', {
      signed: false,
    }) || this.skin.default;
    const list = this.skin.listist;
    const currentList = [];
    list.forEach(item => {
      if (item.skinId === id) {
        currentList.push(item);
      }
    });
    return {
      skinTypeId: this.skin.skinTypeId,
      listist: currentList,
      default: this.skin.default,
    };
  }

  getSkin(fileName, fileBasePath) {
    let obj = {};
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${fileName}.json`), 'utf-8'));
      // eslint-disable-next-line no-empty
    } catch (err) {

    }
    if (!Object.keys(obj).length) {
      obj = this.publicInfo.skin;
    }

    return obj;
  }

  getSourceMap() {
    let sourceMap = {};
    try {
      sourceMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../view/src/utils/imgMap.json'), 'utf-8'));
    } catch (e) {

    }
    return sourceMap;
  }

  getImgMap() {
    const homeImgList = [
      'home_edit_imga', 'home_edit_imgb', 'home_edit_bg', 'home_edit_icon', 'home_edit_icon1',
      'home_edit_icon2', 'home_edit_icon3', 'home_edit_icon4', 'inforHeadBg', 'head', 'inforHeadBg',
      'int_banner', 'int_logo', 'interAppBg', 'interBanner_1', 'interBanner_2', 'interBanner_3',
      'interBanner_4', 'interCcustom1', 'interCcustom2', 'interCcustom3', 'interCcustom4', 'interHomeA',
      'interPhone',
    ];
    const imgMap = JSON.parse(fs.readFileSync(path.join(__dirname, '../view/src/utils/imgMap.json'), 'utf-8'));
    const hImg = {};
    homeImgList.forEach(item => {
      if (imgMap[item]) {
        hImg[item] = imgMap[item];
      }
    });
    return JSON.stringify(hImg);
  }

  getNoticeList(noticeInfoList) {
    if (!this.publicInfo.switch) {
      return [];
    }
    const { index_international_open } = this.publicInfo.switch;
    if (noticeInfoList && noticeInfoList.length) {
      const arr = [];
      let length = 18;
      if (index_international_open === 1) {
        length = 50;
      }
      noticeInfoList.forEach(item => {
        const space = item.title.length > length ? '...' : '';
        arr.push({
          noticeText: `${item.title.substr(0, length)}${space}`,
          id: item.id,
        });
      });
      return arr.slice(0, 3);
    }
    return [];
  }

  getColorList(lan) {
    const { skin } = this;
    if (!skin) {
      return [];
    }
    let sk = skin.default;
    const cusSkin = this.ctx.cookies.get('cusSkin', {
      signed: false,
    });
    if (cusSkin && cusSkin !== 'undefined') {
      sk = cusSkin;
    }
    const list = [];
    const lis = skin.listist;
    lis.forEach(item => {
      let name = item.mainClor;
      if (item.skinName && item.skinName[lan]) {
        name = item.skinName[lan];
      }
      const obj = {
        mainClor: name,
        skinId: item.skinId,
      };
      if (item.skinId === sk) {
        obj.checked = 'checked';
      }
      list.push(obj);
    });
    return list;
  }

  __getLocale(val) {
    const arr = val.split('.');
    let locale = this.locale;
    let geted = true;
    arr.forEach(item => {
      if (locale[item]) {
        locale = locale[item];
      } else {
        geted = false;
      }
    });
    return geted ? locale : val;
  }

  orderList() {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    if (!pubSwitch) {
      return arr;
    }
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('order.index.exOrder'),
        link: '/order/exchangeOrder',
      });
    }
    const otcTitle = !pubSwitch.fiat_trade_open
      ? this.__getLocale('order.index.otcOrder')
      : this.__getLocale('assets.b2c.otcShow.otcOrder');

    if (headerLink.otc) {
      arr.push({
        title: otcTitle,
        link: '/order/otcOrder',
      });
    }
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: otcTitle,
        link: '/order/otcOrder',
      });
    }
    if (headerLink.co) {
      let url = `${headerLink.co}/order/coOrder`;
      if (this.app.config.buildEnv === 'co') {
        url = '/order/coOrder';
      }
      arr.push({
        title: this.__getLocale('order.coOrder.coOrder'),
        link: url,
      });
    }
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('order.index.leverage'),
        link: '/order/leverageOrder',
      });
    }
    return arr;
  }

  assetsList() {
    const arr = [];
    const { headerLink } = this;
    const pubSwitch = this.publicInfo.switch;
    if (!this.publicInfo.switch) {
      return arr;
    }
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('assets.index.exchangeAccount'),
        link: '/assets/exchangeAccount',
      });
    }

    const otcTitle = !(pubSwitch.fiat_trade_open)
      ? this.__getLocale('assets.index.otcAccount')
      : this.__getLocale('assets.b2c.otcShow.otcAccount');

    if (headerLink.otc) {
      arr.push({
        title: otcTitle,
        link: '/assets/otcAccount',
      });
    }
    if (Number(pubSwitch.fiat_trade_open)) {
      arr.push({
        title: this.__getLocale('assets.index.otcAccount'),
        link: '/assets/b2cAccount',
      });
    }
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: otcTitle,
        link: '/assets/otcAccount',
      });
    }
    if (headerLink.co) {
      let url = `${headerLink.co}/assets/coAccount`;
      if (this.app.config.buildEnv === 'co') {
        url = '/assets/coAccount';
      }
      arr.push({
        title: this.__getLocale('assets.index.coAccount'),
        link: url,
      });
    }
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('assets.index.leverage'),
        link: '/assets/leverageAccount',
      });
    }
    return arr;
  }

  getLocalData(fileName, fileBasePath, lan) {
    let obj = {};
    let fileLan = '';
    if (lan) {
      fileLan = `${lan}-`;
    }
    try {
      obj = JSON.parse(fs.readFileSync(path.join(fileBasePath, `${fileLan}${fileName}.json`), 'utf-8'));
      // eslint-disable-next-line no-empty
    } catch (err) {

    }
    return obj.data;
  }

  getHeaderLink() {
    const { url } = this.publicInfo;
    if (url) {
      return {
        home: url.exUrl,
        trade: url.exUrl ? `${url.exUrl}/trade` : '',
        market: url.exUrl ? `${url.exUrl}/market` : '',
        otc: url.otcUrl,
        lever: url.exUrl ? `${url.exUrl}/margin` : '',
        co: url.coUrl,
      };
    }
    return {};
  }

  getHeaderList() {
    const arr = [];
    const pubSwitch = this.publicInfo.switch;
    const { headerLink } = this;
    if (!pubSwitch) {
      return arr;
    }
    // 行情
    if (pubSwitch.index_kline_switch === '1') {
      arr.push({
        title: this.__getLocale('header.market'),
        activeId: 'market',
        link: headerLink.market,
      });
    }

    // 币币交易
    if (headerLink.trade) {
      arr.push({
        title: this.__getLocale('header.trade'),
        activeId: 'exTrade',
        link: headerLink.trade,
      });
    }
    // 法币
    /*    if (headerLink.otc) {
      arr.push({
        title: Number(pubSwitch.fiatTradeOpen) ?
          this.__getLocale('assets.b2c.otcShow.header') : this.__getLocale('header.otc'),
        activeId: 'otcTrade',
        link: headerLink.otc,
      });
    }*/
    const otcArr = [];
    const otcObj = {
      title: this.__getLocale('header.otc'),
      activeId: 'otcTrade',
      link: headerLink.otc,
    };
    if (headerLink.otc) {
      otcArr.push(otcObj);
    }
    // 信用卡
    if (Number(pubSwitch.middleman_config_open)) {
      otcArr.push({
        title: this.__getLocale('creditCard.title'),
        activeId: 'crad',
        link: `/${this.lan}/creditCard`,
      });
    }
    if (otcArr.length) {
      let otcHeader = {};
      if (otcArr.length > 1) {
        otcHeader = otcObj;
      } else {
        const [ vc ] = otcArr;
        otcHeader = vc;
      }
      if (otcArr.length > 1) {
        otcHeader.selectList = JSON.parse(JSON.stringify(otcArr));
        otcHeader.isOtcList = true;
      }
      arr.push(otcHeader);
    }
    // 一键买币
    if (!headerLink.otc && Number(pubSwitch.saas_otc_flow_config)) {
      arr.push({
        title: this.__getLocale('mobilityTrade.immediately'),
        activeId: 'otcTrade',
        link: '/mobility',
      });
    }
    // 合约
    if (headerLink.co) {
      arr.push({
        title: this.__getLocale('header.co'),
        activeId: 'coTrade',
        link: headerLink.co,
      });
    }
    // 杠杆
    if (Number(pubSwitch.lever_open)) {
      arr.push({
        title: this.__getLocale('header.lever'),
        activeId: 'marginTrade',
        link: headerLink.lever,
      });
    }
    // etf
    const { market } = this.publicInfo;
    // 币币交易
    if (pubSwitch.etfOpen && Number(pubSwitch.etfOpen) && market.market.ETF) {
      arr.push({
        title: this.__getLocale('etfAdd.title'),
        activeId: 'etf',
        link: this.etfUrl(),
      });
    }
    return arr;
  }

  etfUrl() {
    let str = '';
    const { market } = this.publicInfo;
    if (market) {
      const etfArr = [];
      if (market.market.ETF && market.market.ETF.length) {
        Object.keys(market.market.ETF).forEach(ci => {
          etfArr.push(market.market.ETF[ci]);
        });
        if (etfArr.length) {
          const symbol = etfArr.sort(compare('sort'))[0];
          const name = symbol.showName || symbol.name;
          str = name.replace('/', '_');
        }
      }
    }
    return `${this.headerLink.trade}/${str}`;
  }

  setLan(domain) {
    const { lan } = this.publicInfo;
    // 取得client一级路由 clientUrlLan
    const clientUrlLan = this.ctx.request.path.split('/')[1];
    // 取得client cookie中语言 clientCookLan
    const clientCookLan = this.ctx.cookies.get('lan');
    const cookieDomain = domain === 'hiex.pro' ? 'bitwind.com' : domain;
    const dLan = 'en_US';
    const reg = /^[a-z]{2}_[A-Z]{2}$/;
    if (lan) {
      // 针对 publicInfo => lan => defLan 兼容处理
      let serverDefLan = dLan;
      if (lan.defLan) {
        serverDefLan = this.publicInfo.lan.defLan;
      } else {
        const errorData = {
          domain,
          message: `未拿到publicInfo.lan.defLan对象, 语言强制转为${serverDefLan}`,
          key: 'publicInfo.lan.defLan',
          data: lan.defLan,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }

      // 针对 publicInfo => lan => lanList 兼容处理
      let severLanList = [];
      if (lan.lanList instanceof Array) {
        severLanList = lan.lanList;
      } else {
        const errorData = {
          domain,
          message: '未拿到publicInfo.lan.lanList对象, 转为[]',
          key: 'publicInfo.lan.lanList',
          data: lan.lanList,
        };
        if (!hostFilter.test(domain)) {
          this.logger.error(JSON.stringify(errorData));
        }
      }

      // 处理数据 lans
      const lans = [];
      if (severLanList.length) {
        severLanList.forEach(item => {
          lans.push(item.id);
        });
      } else {
        lans.push(serverDefLan);
      }
      // 如果url中的语言合法，则同步cookie
      if (lans.indexOf(clientUrlLan) !== -1) {
        this.ctx.cookies.set('lan', clientUrlLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
      } else {
        const lan = lans.indexOf(clientCookLan) !== -1 ? clientCookLan : serverDefLan;
        let redirectUrl = '';
        if (reg.test(clientUrlLan)) {
          const vu = this.ctx.request.url.split(`/${clientUrlLan}`)[1];
          redirectUrl = vu;
        } else {
          redirectUrl = this.ctx.request.url;
        }
        this.ctx.cookies.set('lan', lan, {
          httpOnly: false,
          domain: cookieDomain,
        });
        this.ctx.redirect(`/${lan}${redirectUrl}`, 302);
      }

      this.lan = clientUrlLan;
    } else {
      const errorData = {
        domain,
        message: `未拿到publicInfo.lan对象, 语言强制转为${dLan}`,
        key: 'publicInfo.lan',
        data: lan,
      };
      if (!hostFilter.test(domain)) {
        this.logger.error(JSON.stringify(errorData));
      }
      if (clientUrlLan === dLan) {
        this.ctx.cookies.set('lan', dLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
      } else {
        let redirectUrl = '';
        if (reg.test(clientUrlLan)) {
          const vu = this.ctx.request.url.split(`/${clientUrlLan}`)[1];
          redirectUrl = vu;
        } else {
          redirectUrl = this.ctx.request.url;
        }
        this.ctx.cookies.set('lan', dLan, {
          httpOnly: false,
          domain: cookieDomain,
        });
        this.ctx.redirect(`/${dLan}${redirectUrl}`, 302);
      }
      this.lan = clientUrlLan;
    }
  }
}

module.exports = StaticIndex;
