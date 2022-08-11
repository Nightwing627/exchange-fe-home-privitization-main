const { removeLogConfig, removeLog } = require('@knoxexchange/blockchain-ui-privatization/node/schedule/remove-log');

module.exports = {
  schedule: removeLogConfig,
  async task(ctx) {
    removeLog(ctx);
  },
};
