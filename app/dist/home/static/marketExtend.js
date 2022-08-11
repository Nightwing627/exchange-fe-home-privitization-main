(() => {
  const {
    myStorage, getCoinShowName, getScript,
  } = window.BlockChainUtils;
  const { emitter, location, fetchData } = window;
  class MarketExtend {
    sortIcon(v, sortValue, sortSell) {
      let str = '#icon-a_17';
      if (v === sortValue) {
        if (sortSell) {
          str = '#icon-a_17_1';
        } else {
          str = '#icon-a_17_2';
        }
      }
      return str;
    }

    initScroll() {
      if (window.IScroll) {
        this.scroll = new window.PerfectScrollbar(this.$homeTbody);
      } else {
        getScript(`${window.staticDomain}/home/static/js/perfect-scrollbar.min.js`).then(() => {
          this.scroll = new window.PerfectScrollbar(this.$homeTbody);
        });
      }
    }

    dataLength(tableData) {
      let len = 0;
      tableData.forEach((item) => {
        if (tableData.length > 1) {
          len += 1;
        }
        item.data.forEach(() => {
          len += 1;
        });
      });
      return len;
    }

    tableHeight(dataLength) {
      let h = 300;
      const spk = 30; // 条数
      if (dataLength > 5 && dataLength < spk) {
        h = 56 * dataLength;
      } else if (dataLength >= spk) {
        h = 56 * spk;
      }
      return h;
    }

    createTableHead() {
      let html = '';
      this.columns.forEach((item, index) => {
        let icon = '';
        let className = 'thead-label';
        if (item.sortable) {
          className = 'thead-label sortable';
          icon = `<svg aria-hidden="true" class="icon icon-14">
                                      <use xlink href="${this.sortIcon(item.key, 'sort', false)}"></use>
                                    </svg>`;
        }
        html += `<li>
                                  <span class="${className}" data-index="${index}">
                                    ${item.title}
                                    ${icon}
                                  </span>
                            </li>`;
      });
      this.$homeThead.innerHTML = html;
      this.bindTitleEvent();
    }

    createMarketTitle(dataList, coinList) {
      let html = '';
      html += `<li class="c-8-bd" data-market="myMarket">
                         ${this.locale.marketSet}
                        </li>`;
      dataList.forEach((item) => {
        let className = '';
        if (this.marketCurrent === item) {
          className = `${this.hoverClass} selected`;
        }
        html += `<li class="${className}" data-market="${item}">
                            ${getCoinShowName(item, coinList)}
                            </li>`;
      });
      this.$marketTitle.innerHTML = html;
    }

    switchMarket(data) {
      if (this.createIng) return;
      this.listfilter = null;
      this.marketCurrent = data;
      this.createIng = true;
      if (data !== 'myMarket') {
        myStorage.set('homeMarkTitle', data);
      }
      emitter.emit('SWITCH-MARKET', data);
    }

    overHandler(target) {
      // eslint-disable-next-line no-param-reassign
      let cl = 'f-1-cl c-3-bg';
      if (this.tableListOverClass) {
        cl = this.tableListOverClass;
      }
      let liBorder = 'c-5-bd';
      if (typeof this.liBorder === 'string') {
        liBorder = this.liBorder;
      }
      // eslint-disable-next-line no-param-reassign
      target.className = `home-tbody-li ${liBorder} ${cl}`;
    }

    outHandler($list) {
      let liBorder = 'c-5-bd';
      if (typeof this.liBorder === 'string') {
        liBorder = this.liBorder;
      }
      let liColor = 'f-1-cl';
      if (typeof this.liColor === 'string') {
        liColor = this.liColor;
      }
      $list.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.className = `home-tbody-li ${liBorder} ${liColor} ${this.tableBg ? this.tableBg : ''}`;
      });
    }

    // 设置 自选币对
    setMyMarket(symbol) {
      let url = '/fe-ex-api/common/update_optional_symbol';
      if (this.optional_symbol_server_open === 1) {
        url = '/fe-ex-api/optional/update_symbol';
      }
      // 防止重复点击
      if (!this.setMyMarketSwitch) return;
      this.setMyMarketSwitch = false;

      let mySymbol = myStorage.get('mySymbol') || [];
      let addOrDelete = true;
      if (mySymbol.length && mySymbol.indexOf(symbol) > -1) {
        mySymbol = mySymbol.filter((item) => item !== symbol);
        addOrDelete = false;
      } else {
        mySymbol.push(symbol);
        addOrDelete = true;
      }
      if (this.optional_symbol_server_open === 1 && window.isLogin) {
        fetchData({
          url,
          method: 'post',
          params: {
            operationType: addOrDelete === true ? '1' : '2', // 0批量添加 1单个添加 2单个删除
            symbols: symbol,
          },
        }).then((data) => {
          if (data.code === '0') {
            this.setMyMarketSwitch = true;
            this.mySymbolList = mySymbol;
            myStorage.set('mySymbol', mySymbol);
          } else {
            emitter.emit('tip', { text: data.msg, type: 'error' });
          }
        });
      } else {
        this.setMyMarketSwitch = true;
        this.mySymbolList = mySymbol;
        myStorage.set('mySymbol', mySymbol);
      }
    }

    changeIcon(iconHtml) {
      if (iconHtml.indexOf('c_11_1') > -1) {
        return `<svg class="icon icon-16" aria-hidden="true">
                            <use xlink:href="#icon-c_11">
                          </use></svg>`;
      }
      return `<svg class="icon icon-16" aria-hidden="true">
                            <use xlink:href="#icon-c_11_1">
                          </use></svg>`;
    }

    marketIconClick(target) {
      const { realcoin } = target.dataset;
      // eslint-disable-next-line no-param-reassign
      target.innerHTML = this.changeIcon(target.innerHTML);
      this.setMyMarket(realcoin);
      emitter.emit('SWITCH-STORE', realcoin);
    }

    unBindTableListEvent() {
      const $list = this.$homeTbody.querySelectorAll('.home-tbody-li');
      const $markeIcon = this.$homeTbody.querySelectorAll('.marketIcon');
      const $evenSymbols = this.$homeTbody.querySelectorAll('.evenSymbol');
      $list.forEach((target) => {
        target.removeEventListener('mouseover', this.overHandler, false);
        target.removeEventListener('mouseout', this.outHandler, false);
      });
      $evenSymbols.forEach((target) => {
        target.removeEventListener('click', this.everySymbolClick, false);
      });
      $markeIcon.forEach((target) => {
        target.removeEventListener('click', this.marketIconClick, false);
      });
    }

    everySymbolClick(target) {
      const { etfOpen } = target.dataset;
      const data = target.dataset.id;
      myStorage.set('sSymbolName', data);
      if (etfOpen) {
        myStorage.set('markTitle', 'ETF');
      } else {
        myStorage.set('markTitle', data.split('/')[1]);
      }
      location.href = `/trade/${data.replace('/', '_')}`;
    }

    bindTableListEvent() {
      const $list = this.$homeTbody.querySelectorAll('.home-tbody-li');
      const $markeIcon = this.$homeTbody.querySelectorAll('.marketIcon');
      const $evenSymbols = this.$homeTbody.querySelectorAll('.evenSymbol');
      $evenSymbols.forEach((target) => {
        target.addEventListener('click', this.everySymbolClick.bind(this, target), false);
      });
      $markeIcon.forEach((target) => {
        target.addEventListener('click', this.marketIconClick.bind(this, target), false);
      });
      $list.forEach((target) => {
        target.addEventListener('mouseover', this.overHandler.bind(this, target), false);
        target.addEventListener('mouseout', this.outHandler.bind(this, $list), false);
      });
    }

    sort(v) {
      if (this.createIng) return;
      if (!v.sortable) return;
      if (this.sortValue !== v.key) {
        this.sortValue = v.key;
        this.sortSell = true;
      } else {
        this.sortSell = !this.sortSell;
      }
    }

    changeSortableIcon(target) {
      const $use = target.querySelector('use');
      const href = $use.getAttribute('href');
      this.$homeThead.querySelectorAll('.sortable').forEach((item) => {
        item.querySelector('use').setAttribute('href', '#icon-a_17');
      });
      if (href.indexOf('a_17_2') > -1) {
        $use.setAttribute('href', '#icon-a_17_1');
      } else {
        $use.setAttribute('href', '#icon-a_17_2');
      }
    }

    bindTitleEvent() {
      this.$homeThead.querySelectorAll('.sortable').forEach((item) => {
        item.addEventListener('click', () => {
          this.sort(this.columns[item.dataset.index]);
          this.changeSortableIcon(item);
          emitter.emit('SWITCH-MARKET', myStorage.get('homeMarkTitle'));
        }, false);
      });
    }

    bindEvent() {
      // this.$searchInput.addEventListener('input', (e) => {
      //   const { target } = e;
      //   const val = target.value;
      //   const data = this.marketDataList_bar;
      //   let isSearch = false;
      //   if (val) {
      //     isSearch = true;
      //   }
      //   this.listfilter = val;
      //   this.resloveData(data, isSearch);
      //   this.tableDataList = this.tableData();
      //   this.rebuild = true;
      //   this.firstLoad = true;
      //   this.createIng = true;
      //   this.createTable(this.tableDataList);
      // }, false);

      this.$marketTitle.addEventListener('click', (e) => {
        const { target } = e;
        const currentMarket = target.dataset.market;
        this.$marketTitle.querySelectorAll('li').forEach((item) => {
          // eslint-disable-next-line no-param-reassign
          item.className = '';
        });
        target.className = `${this.hoverClass} selected`;
        this.switchMarket(currentMarket);
      }, false);
    }

    init(data) {
      this.market = data.market.market;
      this.symbolAll = data.symbolAll;
      this.coinList = data.market.coinList;
      this.createMarketTitle(data.market.marketSort, data.market.coinList);
      this.createTableHead();
      this.bindEvent();
      emitter.on('login', () => {
        this.isLogin = window.isLogin;
      });
    }

    createTable(dataList) {
      let list = JSON.parse(JSON.stringify(dataList));
      let html = '';
      this.tableTreeData = {};
      this.tableTree = {};
      const dataLen = Object.keys(list).length;
      let liBorder = 'c-5-bd';
      if (typeof this.liBorder === 'string') {
        liBorder = this.liBorder;
      }
      let liColor = 'f-1-cl';
      if (typeof this.liColor === 'string') {
        liColor = this.liColor;
      }
      if (dataLen) {
        this.$homeNodata.style.display = 'none';
      }
      list.forEach((data) => {
        let childHtml = '';
        data.data.forEach((item, index) => {
          const evenSymbol = item.data[0][1].iconSvg.match(/>(.+)</)[1];
          if (!this.tableTreeData[evenSymbol]) {
            this.tableTreeData[evenSymbol] = {};
            this.tableTree[evenSymbol] = {};
          }
          this.tableTreeData[evenSymbol].marketIcon = item.data[0][0].iconSvg;
          this.tableTreeData[evenSymbol].price = item.data[1][0].text;
          this.tableTreeData[evenSymbol].subPrice = item.data[1][0].subContent.text;
          this.tableTreeData[evenSymbol].amount = item.data[2][0].text;
          this.tableTreeData[evenSymbol].amountClass = item.data[2][0].classes;
          // this.tableTreeData[evenSymbol].highest = item.data[3][0].text;
          // this.tableTreeData[evenSymbol].lowest = item.data[4][0].text;
          // this.tableTreeData[evenSymbol].deal = item.data[5][0].text;
          // this.tableTreeData[evenSymbol].volume = item.data[6][0].text;
          childHtml += `<li class="home-tbody-li ${this.tableBg}" data-coin="${evenSymbol}" data-realCoin="${item.id}">
                                        <!-- 币对 -->
                                        <div class="even">
                                        <span class="marketIndex">${index + 1}</span>
                          <span class="marketIcon" data-coin="${evenSymbol}" data-realCoin="${item.id}">${item.data[0][0].iconSvg}</span>
                                            <span class="evenSymbol" data-id="${item.id}" data-eftOpen="${item.etfOpen}">${item.data[0][1].iconSvg}</span>
                                            ${item.etfOpen && this.marketCurrent !== 'ETF' ? '<span class="eft-class u-8-bd u-8-cl">ETF</span>' : ''}
                                        </div>
                                        <!-- 最新价 -->
                                        <div class="even newPrice">
                                            <p class="price">${item.data[1][0].text}</p>
                                            <p class="subPrice">${item.data[1][0].subContent.text}</p>
                                        </div>
                                        <!-- 涨跌幅 -->
                                        <div class="even">
                                            <div class="amount ${item.data[2][0].classes.join(' ')}">${item.data[2][0].text}</div>
                                        </div>
                                        <div class="even buy-button" data-coin="${evenSymbol}">Buy</div>
                                    </li>`;
        });
        if (dataLen > 1) {
          html += `<div class="home-tbody" data-coin="${data.title}">
                                 <div>
                                     <div class="home-tbody-title c-5-bd ${this.titleBg ? this.titleBg : ''}">
                                         <span class="lable c-5-bd">${data.title}</span>
                                     </div>
                                     <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
        } else {
          html += `<div class="home-tbody" data-coin="${data.title}">
                                 <div>
                                     <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
        }
      });
      this.$homeTbody.innerHTML = `<div class="scroll-warper">${html}</div>`;
      const lis = this.$homeTbody.querySelectorAll('.home-tbody-li');
      lis.forEach((item) => {
        const { coin } = item.dataset;
        this.tableTree[coin].price = item.querySelector('.price');
        this.tableTree[coin].subPrice = item.querySelector('.subPrice');
        this.tableTree[coin].amount = item.querySelector('.amount');
        this.tableTree[coin].highest = item.querySelector('.highest');
        this.tableTree[coin].lowest = item.querySelector('.lowest');
        this.tableTree[coin].deal = item.querySelector('.deal');
        this.tableTree[coin].volume = item.querySelector('.volume');
        this.tableTree[coin].marketIcon = item.querySelector('.marketIcon');

        item.querySelector('.buy-button').addEventListener('click', () => {
          location.href = `/trade/${coin.replace('/', '_')}`;
        }, false);
      });
      const len = this.dataLength(list);
      const height = this.tableHeight(len);
      this.$homeLoading.style.display = 'none';
      if (!list.length) {
        this.$homeNodata.style.display = 'block';
      } else {
        this.$homeTbody.style.height = `${height}px`;
        this.$homeTbody.style.display = 'block';
      }
      this.createIng = false;
      this.rebuild = false;
      this.bindTableListEvent();
      if (this.isScroll && lis.length > 20) {
        this.initScroll(this.$homeTbody.querySelector('.scroll-warper'));
      } else if (window.IScroll) {
        this.scroll.destroy();
      }
      list = null;
    }

    dataSort(v) {
      if (this.sortValue.length) {
        return v.sort((a, b) => {
          let first = a;
          let end = b;
          if (this.sortSell) {
            first = b;
            end = a;
          }
          switch (this.sortValue) {
            case 'roses':
              return (parseFloat(first.data[2][0].sortVal) || 0)
                - (parseFloat(end.data[2][0].sortVal) || 0);
            case 'closes':
              return (parseFloat(first.data[1][0].sortVal) || 0)
                - (parseFloat(end.data[1][0].sortVal) || 0);
            default:
              return (parseFloat(first.data[0][1].sortVal) || 0)
                - (parseFloat(end.data[0][1].sortVal) || 0);
          }
        });
      }
      return v;
    }

    tableData() {
      const arr = [];
      const result = [];
      if (this.halveAreaData.length) {
        const data = this.dataSort(this.halveAreaData);
        arr.push({
          title: this.locale.halving,
          titleIndex: 0,
          data,
        });
      }
      if (this.MainAreaData.length) {
        const data = this.dataSort(this.MainAreaData);
        arr.push({
          title: this.locale.maincon,
          data,
        });
      }
      if (this.CreateAreaData.length) {
        const data = this.dataSort(this.CreateAreaData);
        arr.push({
          title: this.locale.newcon,
          data,
        });
      }
      if (this.SeeAreaData.length) {
        const data = this.dataSort(this.SeeAreaData);
        arr.push({
          title: this.locale.seecon,
          data,
        });
      }
      if (this.unsealAreaData.length) {
        const data = this.dataSort(this.unsealAreaData);
        arr.push({
          title: this.locale.unseal,
          data,
        });
      }
      arr.forEach((el) => {
        const item = el;
        const data = el.data.filter((e) => e.isShow || this.listfilter || this.marketCurrent === 'myMarket');

        if (data.length) {
          item.data = data;
          const newItem = item;
          item.data.forEach((citem, index) => {
            newItem.data[index].etfOpen = this.symbolAll[citem.id].etfOpen;
            // citem.etfOpen
          });
          result.push(newItem);
        }
      });
      return result;
    }

    filterArea() {
      const MainAreaFilter = []; // 主区币种
      const CreateAreaFilter = []; // 创新区币种
      const SeeAreaFilter = []; // 观察区币种
      const hideAreaFilter = []; // 隐藏区币种
      const unsealAreaFilter = []; // 解封区币种
      const halveAreaFilter = []; // 减半区币种
      const data = JSON.parse(JSON.stringify(this.market));
      Object.keys(data).forEach((item) => {
        Object.keys(data[item]).forEach((citem) => {
          const { newcoinFlag, name } = data[item][citem];
          // 解封区
          if (this.coinList[name.split('/')[0]]
            && this.coinList[name.split('/')[0]].isOvercharge
            && this.coinList[name.split('/')[0]].isOvercharge.toString() === '1') {
            unsealAreaFilter.push(citem);
          } else if (newcoinFlag === 1) {
            // 创新区
            CreateAreaFilter.push(citem);
            // 观察区
          } else if (newcoinFlag === 2) {
            SeeAreaFilter.push(citem);
          } else if (newcoinFlag === 0) {
            MainAreaFilter.push(citem);
          } else if (newcoinFlag === 3) {
            halveAreaFilter.push(citem);
          }
        });
      });
      this.MainAreaFilter = MainAreaFilter;
      this.CreateAreaFilter = CreateAreaFilter;
      this.SeeAreaFilter = SeeAreaFilter;
      this.hideAreaFilter = hideAreaFilter;
      this.unsealAreaFilter = unsealAreaFilter;
      this.halveAreaFilter = halveAreaFilter;
    }

    setData(val, isSearch = false) {
      const MainArea = []; // 主区
      const CreateArea = []; // 创新区
      const SeeArea = []; // 观察区
      const hideArea = []; // 隐藏区
      const unsealArea = []; // 解封区
      const halveArea = []; // 减半区
      val.forEach((item) => {
        if (this.MainAreaFilter.indexOf(item.id) !== -1) {
          MainArea.push(item);
        }
        if (this.CreateAreaFilter.indexOf(item.id) !== -1) {
          CreateArea.push(item);
        }
        if (this.SeeAreaFilter.indexOf(item.id) !== -1) {
          SeeArea.push(item);
        }
        if (this.hideAreaFilter.indexOf(item.id) !== -1) {
          hideArea.push(item);
        }
        if (this.unsealAreaFilter.indexOf(item.id) !== -1 && !isSearch) {
          unsealArea.push(item);
        }
        if (this.halveAreaFilter.indexOf(item.id) !== -1) {
          halveArea.push(item);
        }
      });
      this.MainAreaData = MainArea;
      this.CreateAreaData = CreateArea;
      this.SeeAreaData = SeeArea;
      this.hideAreaData = hideArea;
      this.unsealAreaData = unsealArea;
      this.halveAreaData = halveArea;
    }

    resloveData(val, isSearch) {
      this.marketDataList_bar = val;
      let data = val;
      if (this.listfilter) {
        const reg = new RegExp(this.listfilter, 'gim');
        data = this.marketDataList_bar.filter((item) => item.showName.match(reg));
      }
      this.setData(data, isSearch);
    }

    changeTable(dataList) {
      dataList.forEach((data) => {
        data.data.forEach((item) => {
          const evenSymbol = item.data[0][1].iconSvg.match(/>(.+)</)[1];
          if (this.tableTreeData[evenSymbol]) {
            if (this.tableTreeData[evenSymbol].marketIcon !== item.data[0][0].iconSvg) {
              this.tableTree[evenSymbol].marketIcon.innerHTML = item.data[0][0].iconSvg;
              this.tableTreeData[evenSymbol].marketIcon = item.data[0][0].iconSvg;
            }

            if (this.tableTreeData[evenSymbol].price !== item.data[1][0].text) {
              this.tableTree[evenSymbol].price.innerHTML = item.data[1][0].text;
              this.tableTreeData[evenSymbol].price = item.data[1][0].text;
            }

            if (this.tableTreeData[evenSymbol].subPrice !== item.data[1][0].subContent.text) {
              this.tableTree[evenSymbol].subPrice.innerHTML = item.data[1][0].subContent.text;
              this.tableTreeData[evenSymbol].subPrice = item.data[1][0].subContent.text;
            }

            if (this.tableTreeData[evenSymbol].amount !== item.data[2][0].text) {
              this.tableTree[evenSymbol].amount.innerHTML = item.data[2][0].text;
              this.tableTreeData[evenSymbol].amount = item.data[2][0].text;
            }

            if (this.tableTreeData[evenSymbol].amountClass !== item.data[2][0].classes) {
              this.tableTree[evenSymbol].amount.className = `amount ${item.data[2][0].classes.join(' ')}`;
              this.tableTreeData[evenSymbol].amountClass = item.data[2][0].classes;
            }

            // if (this.tableTreeData[evenSymbol].highest !== item.data[3][0].text) {
            //   this.tableTree[evenSymbol].highest.innerHTML = item.data[3][0].text;
            //   this.tableTreeData[evenSymbol].highest = item.data[3][0].text;
            // }

            // if (this.tableTreeData[evenSymbol].lowest !== item.data[4][0].text) {
            //   this.tableTree[evenSymbol].lowest.innerHTML = item.data[4][0].text;
            //   this.tableTreeData[evenSymbol].lowest = item.data[4][0].text;
            // }
            // if (this.tableTreeData[evenSymbol].deal !== item.data[5][0].text) {
            //   this.tableTree[evenSymbol].deal.innerHTML = item.data[5][0].text;
            //   this.tableTreeData[evenSymbol].deal = item.data[5][0].text;
            // }
            // if (this.tableTreeData[evenSymbol].volume !== item.data[6][0].text) {
            //   this.tableTree[evenSymbol].volume.innerHTML = item.data[6][0].text;
            //   this.tableTreeData[evenSymbol].volume = item.data[6][0].text;
            // }
          }
        });
      });
    }

    initTable(data) {
      const inData = JSON.parse(JSON.stringify(data));
      // eslint-disable-next-line no-param-reassign
      data = null;
      this.unBindTableListEvent();
      this.filterArea();
      this.resloveData(inData);
      this.tableDataList = this.tableData();
      if (!this.firstLoad || this.rebuild) {
        this.$homeTbody.style.display = 'none';
        this.$homeLoading.style.display = 'block';
        this.firstLoad = true;
        this.createIng = true;
        this.createTable(this.tableDataList);
      } else if (!this.createIng && !this.rebuild) {
        this.changeTable(this.tableDataList);
      }
    }
  }
  window.MarketExtend = MarketExtend;
})();
