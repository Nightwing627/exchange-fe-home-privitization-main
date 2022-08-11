const { Service } = require('egg');
const { getSetData } = require('@knoxexchange/blockchain-ui-privatization/node/utils');

class getFooterList extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.footerList, '/cms/footer/list', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.footerList, '/cms/footer/list', currenLan);
  }
}

module.exports = getFooterList;
