const { Service } = require('egg');
const { getSetData } = require('@knoxexchange/blockchain-ui-privatization/node/utils');

class getBannerIndex extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.bannerIndexPath, 'common/index', currenLan);
  }
}

module.exports = getBannerIndex;
