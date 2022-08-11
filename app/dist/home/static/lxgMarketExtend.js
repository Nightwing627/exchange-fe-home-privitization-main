(() => {
  const {
    myStorage, getCoinShowName, getScript, colorMap,
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
        this.scroll = new window.IScroll(this.$homeTbody, {
          scrollbars: true,
          mouseWheel: true,
        });
        this.$homeTbody.querySelector('.iScrollIndicator').style.background = colorMap['a-2-bg'];
      } else {
        getScript(`${window.staticDomain}/home/static/js/scroll.js`).then(() => {
          this.scroll = new window.IScroll(this.$homeTbody, {
            scrollbars: true,
            mouseWheel: true,
          });
          this.$homeTbody.querySelector('.iScrollIndicator').style.background = colorMap['a-2-bg'];
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

    createHotTableHead() {
      let html = '';
      this.hotColumns.forEach((item, index) => {
        const icon = '';
        html += `<li class="td-item td-item${index + 1}">
                                  <span data-index="${index}">
                                    ${item.title}
                                    ${icon}
                                  </span>
                            </li>`;
      });
      this.$homeThead.innerHTML = html;
      this.bindTitleEvent();
    }

    createTableHead() {
      let html = '';
      this.columns.forEach((item, index) => {
        let icon = '';
        let className = 'thead-label';
        let cl = '';
        if (this.lxg) {
          cl = `item${index}`;
        }
        if (item.sortable) {
          className = 'thead-label sortable';
          icon = `<svg aria-hidden="true" class="icon icon-14">
                                      <use xlink href="${this.sortIcon(item.key, 'sort', false)}"></use>
                                    </svg>`;
        }
        html += `<li class=${cl}>
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

    switchMarketIcon(choice) {
      let icon = `<svg class="icon icon-16" aria-hidden="true">
                            <use xlink:href="#icon-c_11">
                          </use></svg>`;
      if (choice) {
        icon = `<svg class="icon icon-16" aria-hidden="true">
                            <use xlink:href="#icon-c_11_1">
                          </use></svg>`;
      }
      return icon;
    }

    marketIconClick(target) {
      const { realcoin } = target.dataset;
      // eslint-disable-next-line no-param-reassign
      target.innerHTML = this.changeIcon(target.innerHTML);
      this.setMyMarket(realcoin);
      emitter.emit('SWITCH-STORE', realcoin);
    }

    unBindTableListEvent() {
      const $list = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.home-tbody-li'));
      const $markeIcon = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.marketIcon'));
      const $evenSymbols = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.evenSymbol'));
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
      if (this.$lxgTitle) {
        const filList = Array.prototype.slice.call(this.$lxgTitle.querySelectorAll('.fil'));
        filList.forEach((item) => {
          item.removeEventListener('click', this.lxgFil, false);
        });
      }
    }

    lxgFil(filList, e) {
      const { target } = e;
      const { id } = target.dataset;
      filList.forEach((i) => {
        i.classList.remove('active');
      });
      target.classList.add('active');
      // eslint-disable-next-line no-restricted-properties
      if (window.isNaN(Number(id))) {
        this.filId = id;
        this.marketCurrent = '';
        this.createHotTableHead();
        this.createHotTable();
        this.$homeTbody.style.overflowY = 'hidden';
        this.$homeTbody.style.borderBottom = 'none';
      } else {
        this.$homeTbody.style.overflowY = 'scroll';
        this.$homeTbody.style.borderBottom = '1px solid #e2e9ef';
        this.filId = Number(id);
        this.createTable(this.tableDataList);
      }
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
      location.href = '/trade';
    }

    bindTableListEvent() {
      const $list = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.home-tbody-li'));
      const $markeIcon = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.marketIcon'));
      const $evenSymbols = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.evenSymbol'));
      if (this.$lxgTitle) {
        const filList = Array.prototype.slice.call(this.$lxgTitle.querySelectorAll('.fil'));
        filList.forEach((item) => {
          item.addEventListener('click', this.lxgFil.bind(this, filList), false);
        });
      }
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
      Array.prototype.slice.call(this.$homeThead.querySelectorAll('.sortable')).forEach((item) => {
        item.querySelector('use').setAttribute('href', '#icon-a_17');
      });
      if (href.indexOf('a_17_2') > -1) {
        $use.setAttribute('href', '#icon-a_17_1');
      } else {
        $use.setAttribute('href', '#icon-a_17_2');
      }
    }

    bindTitleEvent() {
      Array.prototype.slice.call(this.$homeThead.querySelectorAll('.sortable')).forEach((item) => {
        item.addEventListener('click', () => {
          this.sort(this.columns[item.dataset.index]);
          this.changeSortableIcon(item);
          emitter.emit('SWITCH-MARKET', myStorage.get('homeMarkTitle'));
        }, false);
      });
    }

    bindEvent() {
      if (this.$searchInput) {
        this.$searchInput.addEventListener('input', (e) => {
          const { target } = e;
          const val = target.value;
          const data = this.marketDataList_bar;
          let isSearch = false;
          if (val) {
            isSearch = true;
          }
          this.listfilter = val;
          this.resloveData(data, isSearch);
          this.tableDataList = this.tableData();
          this.rebuild = true;
          this.firstLoad = true;
          this.createIng = true;
          this.createTable(this.tableDataList);
        }, false);
      }
      if (this.$marketTitle) {
        this.$marketTitle.addEventListener('click', (e) => {
          const { target } = e;
          const currentMarket = target.dataset.market;
          Array.prototype.slice.call(this.$marketTitle.querySelectorAll('li')).forEach((item) => {
            // eslint-disable-next-line no-param-reassign
            item.className = '';
          });
          target.className = `${this.hoverClass} selected`;
          this.switchMarket(currentMarket);
        }, false);
      }
    }

    init(data) {
      this.market = data.market.market;
      this.symbolAll = data.symbolAll;
      this.coinList = data.market.coinList;
      if (this.$marketTitle) {
        this.createMarketTitle(data.market.marketSort, data.market.coinList);
      }
      this.createTableHead();
      this.bindEvent();
      emitter.on('login', () => {
        this.isLogin = window.isLogin;
      });
    }

    createTable(dataList) {
      const myMarkets = myStorage.get('mySymbol') || [];
      let html = '';
      this.tableTreeData = {};
      this.tableTree = {};
      const dataLen = Object.keys(dataList).length;
      let lxgTitle = '';
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
      dataList.forEach((data, index) => {
        if ((this.filId !== index && this.filId !== 'hot') && this.lxg) {
          return;
        }
        let childHtml = '';
        data.data.forEach((item) => {
          if (this.lxg) {
            if (this.filId === 'hot') {
              if (!this.headerMap[item.id]) {
                return;
              }
            }
          }
          const evenSymbol = item.id;
          if (!this.tableTreeData[evenSymbol]) {
            this.tableTreeData[evenSymbol] = {};
            this.tableTree[evenSymbol] = {};
          }
          this.tableTreeData[evenSymbol].marketIcon = item.data[0][0].iconSvg;
          this.tableTreeData[evenSymbol].price = item.data[1][0].text;
          this.tableTreeData[evenSymbol].subPrice = item.data[1][0].subContent.text;
          this.tableTreeData[evenSymbol].amount = item.data[2][0].text;
          this.tableTreeData[evenSymbol].amountClass = item.data[2][0].classes;
          this.tableTreeData[evenSymbol].highest = item.data[3][0].text;
          this.tableTreeData[evenSymbol].lowest = item.data[4][0].text;
          this.tableTreeData[evenSymbol].deal = item.data[5][0].text;
          this.tableTreeData[evenSymbol].volume = item.data[6][0].text;
          let echarts = '';
          let evenSymbolHtml = `<div class="even">
                                    <span class="marketIcon" data-coin="${evenSymbol}">${item.data[0][0].iconSvg}</span>
                                    <span class="evenSymbol" data-id="${item.id}" data-eftOpen="${item.etfOpen}">${item.data[0][1].iconSvg}</span>
                                            ${item.etfOpen && this.marketCurrent !== 'ETF' ? '<span class="eft-class u-8-bd u-8-cl">ETF</span>' : ''}
                                </div>`;
          if (this.lxg) {
            let img = '';
            if (this.symbolIcon(item)) {
              img = `<img src="${this.symbolIcon(item)}" alt="">`;
            }
            evenSymbolHtml = `<div class="even item0">
                    <span class="marketIcon" data-coin="${evenSymbol}" data-realCoin="${item.id}">${this.switchMarketIcon(myMarkets.indexOf(item.id) > -1)}</span>
                    <span class="symbol-icon">${img}</span>
                    <span class="evenSymbol" data-id="${item.id}">${this.syyshowName(item.showName)}</span>
                    </div>`;
            echarts = `<div class="even item3">
                    <div>
                        <div class="echart-box" style="height: 25px; -webkit-tap-highlight-color: transparent; user-select: none;"></div>
                    </div>
                    </div>`;
          }
          childHtml += `<li class="home-tbody-li ${liBorder} ${liColor} ${this.tableBg}" data-coin="${evenSymbol}" data-realCoin="${item.id}">
                                        <!-- 币对 -->
                                                ${evenSymbolHtml}
                                        <!-- 最新价 -->
                                        <div class="even newPrice item1">
                                            <p class="price">${item.data[1][0].text}</p>
                                            <p class="b-2-cl subPrice">${item.data[1][0].subContent.text}</p>
                                        </div>
                                        <!-- 涨跌幅 -->
                                        <div class="even item2">
                                            <div class="amount ${item.data[2][0].classes.join(' ')}">${item.data[2][0].text}</div>
                                        </div>
                                        ${echarts}
                                        <div class="even highest item4">${item.data[3][0].text}</div>
                                        <div class="even lowest item5">${item.data[4][0].text}</div>
                                        <div class="even deal item6">${item.data[5][0].text}</div>
                                        <div class="even volume item7">${item.data[6][0].text}</div>
                                    </li>`;
        });
        if (dataLen > 1) {
          if (this.lxg) {
            html += `<div class="home-tbody" data-coin="${data.title}">
                                 <div>
                                            <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
          } else {
            html += `<div class="home-tbody" data-coin="${data.title}">
                                 <div>
                                     <div class="home-tbody-title c-5-bd ${this.titleBg ? this.titleBg : ''}">
                                         <span class="lable c-5-bd">${data.title}</span>
                                     </div>
                                     <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
          }
        } else {
          html += `<div class="home-tbody" data-coin="${data.title}">
                                 <div>
                                     <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
        }
      });
      dataList.forEach((data, index) => {
        const act = index === this.filId ? 'active' : '';
        lxgTitle += `<span class="fil tab ${act}" data-id="${index}">${data.title}</span>`;
      });
      this.$lxgTitle.innerHTML = `<span class="tab fil" data-id="hot">${this.locale.hot}</span>${lxgTitle}<a class="checkAll-btn" href="/trade">${this.locale.all}</a>`;
      this.$homeTbody.innerHTML = `<div class="scroll-warper">${html}</div>`;
      const lis = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.home-tbody-li'));
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
        this.tableTree[coin].echarts = item.querySelector('.echart-box');
        this.initEcharts(coin);
      });
      /*eslint-disable */
      const len = this.dataLength(dataList);
      const height = this.tableHeight(len);
      this.$homeLoading.style.display = 'none';
      if (!dataList.length) {
        this.$homeNodata.style.display = 'block';
      } else {
        //   this.$homeTbody.style.height = `${height}px`;
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
    }

    symbolIcon(data) {
      const coin = data.id.split('/')[0];
      const iconImg = this.coinList[coin] ? this.coinList[coin].icon : '';
      return iconImg;
    }

    syyshowName(data) {
      const ar = data.split('/');
      return `${ar[0]} <i>/ ${ar[1]}</i>`;
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
      Object.keys(this.market).forEach((item) => {
        Object.keys(this.market[item]).forEach((citem) => {
          const { newcoinFlag, name } = this.market[item][citem];
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

    renderAllkeyLine(coin) {
      if (this.tableTree[coin]) {
        this.initEcharts(coin);
      }
    }

    initEcharts(coin) {
      const color = this.klineColor;
      const bg = null;
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts[coin] = window.echarts.init(this.tableTree[coin].echarts);
      // 绘制图表
      this.myEcharts[coin].setOption({
        grid: {
          left: -10,
          bottom: 0,
          top: 0,
          right: -10,
        },
        xAxis: {
          show: false,
          type: 'category',
          min: 'dataMin',
          max: 'dataMax',
        },
        yAxis: {
          show: false,
          type: 'value',
          min: 'dataMin',
          max: 'dataMax',
        },
        series: [
          {
            data: [],
            type: 'line',
            symbol: 'none',
            lineStyle: {
              normal: {
                color,
                width: 2,
              },
            },
            areaStyle: bg,
          },
        ],
      });
      this.setKLineData(coin);
    }

    setKLineData(coin) {
      const coinC = coin.replace('-c', '');
      const color = this.klineColor;
      if (this.myEcharts[coin]) {
        this.myEcharts[coin].resize();
        this.myEcharts[coin].setOption({
          series: [
            {
              data: this.allKeyLine[coinC],
              type: 'line',
              lineStyle: {
                normal: {
                  color,
                  width: this.lineWidth,
                },
              },
            },
          ],
        });
      }
    }

    createHotTable() {
      const keys = Object.keys(this.recommendData);
      let html = '';
      this.tableTreeData = {};
      this.tableTree = {};
      const dataLen = keys.length;
      let lxgTitle = '';
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
      let childHtml = '';
      keys.forEach((item, index) => {
        const data = this.recommendData[item];
        if (!Object.keys(data).length) {
          return;
        }
        const evenSymbol = item;
        if (!this.tableTreeData[evenSymbol]) {
          this.tableTreeData[evenSymbol] = {};
          this.tableTree[evenSymbol] = {};
        }
        this.tableTreeData[evenSymbol].price = data.close.data;
        this.tableTreeData[evenSymbol].amount = data.rose.data;
        this.tableTreeData[evenSymbol].amountClass = data.rose.class;
        this.tableTreeData[evenSymbol].highest = data.high;
        this.tableTreeData[evenSymbol].lowest = data.low;
        this.tableTreeData[evenSymbol].deal = data.vol;
        this.tableTreeData[evenSymbol].volume = data.amount;
        let img = '';
        if (this.symbolIcon({ id: item })) {
          img = `<img src=${this.symbolIcon({ id: item })} alt="">`;
        }
        childHtml += `<li class="home-tbody-li ${liBorder} ${liColor} ${this.tableBg}" data-coin="${evenSymbol}">
                                        <!-- 币对 -->
                                        <div class="even td-item1">
                                        ${index + 1}
                                        </div>
                                        <div class="even td-item2" style="width:180px!important;text-align: left!important;padding:0!important;padding-left: 10px!important;">
                                             <span class="symbol-icon" style="margin-right: 16px">
                                            ${img}
                                          </span>
                                          <span class="b-cion">${this.setSymbol(data.symbol.symbol, 'q')}</span>
                                          /
                                            <span class="q-cion">${this.setSymbol(data.symbol.unit, 'b')}</span>
                                        </div>
                                        <!-- 最新价 -->
                                        <div class="even newPrice td-item3">
                                            ${data.close.data}
                                        </div>
                                        <!-- 涨跌幅 -->
                                        <div class="even td-item4">
                                            <div class="amount ${data.rose.class}">${data.rose.data}</div>
                                        </div>
                                       <div class="even td-item-kline">
                                        <div>
                                            <div class="echart-box" style="height: 25px; -webkit-tap-highlight-color: transparent; user-select: none;"></div>
                                        </div>
                                      </div>
                                        <div class="even highest td-item5">${data.high}</div>
                                        <div class="even lowest td-item6">${data.low}</div>
                                        <div class="even deal td-item7">${data.vol}</div>
                                        <div class="even volume td-item8">${data.amount}</div>
                                    </li>`;
      });
      html += `<div class="home-tbody" data-coin="热门推荐">
                                 <div>
                                            <ul class="home-tbody-list">${childHtml}</ul>
                                 </div>
                             </div>`;
      this.tableDataList.forEach((data, index) => {
        const act = '';
        lxgTitle += `<span class="fil tab ${act}" data-id="${index}">${data.title}</span>`;
      });
      this.$lxgTitle.innerHTML = `<span class="tab fil active" data-id="hot">${this.locale.hot}</span>${lxgTitle}<a class="checkAll-btn" href="/trade">${this.locale.all}</a>`;
      this.$homeTbody.innerHTML = `<div class="scroll-warper">${html}</div>`;
      const lis = Array.prototype.slice.call(this.$homeTbody.querySelectorAll('.home-tbody-li'));
      lis.forEach((item) => {
        const { coin } = item.dataset;
        this.tableTree[coin].price = item.querySelector('.newPrice');
        this.tableTree[coin].subPrice = item.querySelector('.subPrice');
        this.tableTree[coin].amount = item.querySelector('.amount');
        this.tableTree[coin].highest = item.querySelector('.highest');
        this.tableTree[coin].lowest = item.querySelector('.lowest');
        this.tableTree[coin].deal = item.querySelector('.deal');
        this.tableTree[coin].volume = item.querySelector('.volume');
        this.tableTree[coin].marketIcon = item.querySelector('.marketIcon');
        this.tableTree[coin].echarts = item.querySelector('.echart-box');
        this.initEcharts(coin);
      });
      // const len = keys.length + 2;
      // const height = this.tableHeight(len);
      this.$homeLoading.style.display = 'none';
      if (!keys.length) {
        this.$homeNodata.style.display = 'block';
      } else {
        // this.$homeTbody.style.height = `${height}px`;
        this.$homeTbody.style.display = 'block';
      }
      this.$homeLoading.style.display = 'none';
      this.createIng = false;
      this.rebuild = false;
      this.bindTableListEvent();
    }

    setSymbol(data) {
      const showData = getCoinShowName(data, this.coinList);
      return showData;
    }

    changeHotTable(dataList) {
      const keys = Object.keys(dataList);
      keys.forEach((item) => {
        const data = dataList[item];
        const evenSymbol = data.name;
        if (this.tableTreeData[evenSymbol]) {
          if (this.tableTreeData[evenSymbol].price !== data.close.data) {
            this.tableTree[evenSymbol].price.innerHTML = data.close.data;
            this.tableTreeData[evenSymbol].price = data.close.data;
          }

          if (this.tableTreeData[evenSymbol].amount !== data.rose.data) {
            this.tableTree[evenSymbol].amount.innerHTML = data.rose.data;
            this.tableTreeData[evenSymbol].amount = data.rose.data;
          }

          if (this.tableTreeData[evenSymbol].amountClass !== data.rose.class) {
            this.tableTree[evenSymbol].amount.className = `amount ${data.rose.class}`;
            this.tableTreeData[evenSymbol].amountClass = data.rose.class;
          }

          if (this.tableTreeData[evenSymbol].highest !== data.high) {
            this.tableTree[evenSymbol].highest.innerHTML = data.high;
            this.tableTreeData[evenSymbol].highest = data.high;
          }

          if (this.tableTreeData[evenSymbol].lowest !== data.low) {
            this.tableTree[evenSymbol].lowest.innerHTML = data.low;
            this.tableTreeData[evenSymbol].lowest = data.low;
          }
          if (this.tableTreeData[evenSymbol].deal !== data.vol) {
            this.tableTree[evenSymbol].deal.innerHTML = data.vol;
            this.tableTreeData[evenSymbol].deal = data.vol;
          }
          if (this.tableTreeData[evenSymbol].volume !== data.amount) {
            this.tableTree[evenSymbol].volume.innerHTML = data.amount;
            this.tableTreeData[evenSymbol].volume = data.amount;
          }
        }
      });
    }

    changeTable(dataList) {
      if (this.filId === 'hot') {
        return;
      }
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

            if (this.tableTreeData[evenSymbol].highest !== item.data[3][0].text) {
              this.tableTree[evenSymbol].highest.innerHTML = item.data[3][0].text;
              this.tableTreeData[evenSymbol].highest = item.data[3][0].text;
            }

            if (this.tableTreeData[evenSymbol].lowest !== item.data[4][0].text) {
              this.tableTree[evenSymbol].lowest.innerHTML = item.data[4][0].text;
              this.tableTreeData[evenSymbol].lowest = item.data[4][0].text;
            }
            if (this.tableTreeData[evenSymbol].deal !== item.data[5][0].text) {
              this.tableTree[evenSymbol].deal.innerHTML = item.data[5][0].text;
              this.tableTreeData[evenSymbol].deal = item.data[5][0].text;
            }
            if (this.tableTreeData[evenSymbol].volume !== item.data[6][0].text) {
              this.tableTree[evenSymbol].volume.innerHTML = item.data[6][0].text;
              this.tableTreeData[evenSymbol].volume = item.data[6][0].text;
            }
          }
        });
      });
    }

    initTable(data) {
      this.unBindTableListEvent();
      this.filterArea();
      this.resloveData(data);
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