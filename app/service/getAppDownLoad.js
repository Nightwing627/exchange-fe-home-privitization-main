const { Service } = require('egg');
const { getSetData } = require('@knoxexchange/blockchain-ui-privatization/node/utils');

class getAppDownLoad extends Service {
  async getdataSync(domainData, host, currenLan) {
    await getSetData(domainData, host, this, this.config.appDownLoadPath, 'common/app_download', currenLan);
  }
  getdata(domainData, host, currenLan) {
    getSetData(domainData, host, this, this.config.appDownLoadPath, 'common/app_download', currenLan);
  }
}

module.exports = getAppDownLoad;
