const serverData = Symbol('Application#serverData');
module.exports = {
  get serverData() {
    return this[serverData];
  },
  set serverData(data){
    this[serverData] = data;
  }
};
