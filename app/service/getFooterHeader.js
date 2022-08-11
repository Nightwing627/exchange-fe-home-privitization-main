const { Service } = require('egg');
const { getSetData } = require('@knoxexchange/blockchain-ui-privatization/node/utils');

class getFooterHeader extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.footerHeaderPath, 'common/footer_and_header', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.footerHeaderPath, 'common/footer_and_header', currenLan);
  }
}

module.exports = getFooterHeader;
