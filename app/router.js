

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/home/getMarket/:id', controller.getMarket.index);
  router.get('/(.+)?/', controller.homePage.index);
};
