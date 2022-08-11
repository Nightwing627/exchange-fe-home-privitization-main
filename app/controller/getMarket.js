const { Controller } = require('egg');
const { getLocale, getFileName, getPublicInfo,  compare } = require('@knoxexchange/blockchain-ui-privatization/node/utils');

class getMarket extends Controller {
  async index(ctx){
    const currenLan = ctx.params.id
    const cusSkin = ctx.cookies.get('cusSkin', {
      signed: false,
    });
    let nowHost = ctx.request.header.host;
    if (ctx.app.config.env === 'local') {
      nowHost = ctx.app.config.devUrlProxy.ex;
    }
   const publicInfo = getPublicInfo(this, currenLan, cusSkin, nowHost);
   ctx.body = { market: publicInfo.market, symbolAll: publicInfo.symbolAll};
  }
}

module.exports = getMarket;
