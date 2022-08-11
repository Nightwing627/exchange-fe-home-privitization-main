(() => {
  const {
    myStorage, setDefaultMarket, getCoinShowName, getScript,
  } = window.BlockChainUtils;
  const lang = window.location.href.match(/[a-z]+_[A-Z]+/)[0];
  const recommendDataList = {};
  let marketDataObj = [];
  const klineDataList = {};
  let mySymbolList = myStorage.get('mySymbol') || [];
  let symbolList = [];
  let coinTagLangs = {};
  const { emitter } = window;
  let marketCurrent = myStorage.get('homeMarkTitle');

  const init = () => {
    const webSocketSend = (type, sendType, symbolData) => {
      emitter.emit('websocketReceive', {
        type: 'WEBSOCKET_SEND',
        data: {
          type,
          sendType,
          symbolData,
          symbolList,
        },
      });
    };

    // 格式化 推荐位的 K线数据
    const setRecommendData = (headerSymbol, coinList) => {
      if (headerSymbol.length) {
        headerSymbol.forEach((item) => {
          recommendDataList[item] = {};
          if (marketDataObj && marketDataObj[item]) {
            recommendDataList[item] = JSON.parse(JSON.stringify(marketDataObj[item]));
          }
        });
        window.emitter.emit('RECOMMEEND_DATA', {
          recommendDataList,
          coinList,
          coinTagLangs,
        });
      }
    };

    // 设置币对是否收藏的ICON
    const myMarketIcon = (symbol) => {
      if (mySymbolList.indexOf(symbol) === -1) {
        return `<svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_11">
              </use></svg>`;
      }
      return `<svg class="icon icon-16" aria-hidden="true">
                <use xlink:href="#icon-c_11_1">
              </use></svg>`;
    };

    const getCoinLabel = (name, coinList = {}) => {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? coinTagLangs[coinTag] : '';
      }

      return '';
    };

    // 24小时行情 涨跌幅 的背景、样色的class
    const itemRoseClass = (rose) => {
      let bgClass = null;
      if (rose.class === 'u-1-cl') {
        bgClass = 'rose-label u-3-bg';
      } else if (rose.class === 'u-4-cl') {
        bgClass = 'rose-label u-6-bg';
      }
      return [rose.class, bgClass];
    };

    // 格式化 推荐位的24小时行情数据
    const setMarketData = (coinList, symbolAll, initData) => {
      if (!symbolList) return;
      const marketDataList = [];
      const keyarr = Object.keys(symbolList);
      keyarr.forEach((item) => {
        const itemData = marketDataObj[item];
        if (itemData) {
          const showName = getCoinShowName(itemData.name, symbolAll);
          const coinLabel = getCoinLabel(itemData.symbol.symbol, coinList);
          let iconSvg = `<span>${showName}</span>`;
          if (coinLabel && Number(window.coinTagOpen)) {
            const str = `<div class="coin-label">
              <span class="coin-text a-12-cl">${coinLabel}</span>
              <span class="coin-bg a-12-bg"></span>
            </div>`;
            iconSvg = `${iconSvg}${str}`;
          }
          marketDataList.push({
            isShow: symbolList[item].isShow,
            id: itemData.name,
            showName,
            data: [
              [
                {
                  iconSvg: myMarketIcon(itemData.name),
                  type: 'icon',
                  eventType: 'store',
                },
                {
                  iconSvg,
                  type: 'icon',
                  eventType: 'symbol',
                  classes: 'symbolName',
                  sortVal: itemData.sort,
                  key: 'sort',
                },
              ],
              [
                {
                  text: itemData.close.data,
                  classes: ['fontSize14'],
                  sortVal: itemData.closes,
                  key: 'closes',
                  subContent: {
                    text: itemData.close.price !== '--' ? `≈ ${itemData.close.price}` : itemData.close.price,
                    classes: ['b-2-cl'], // 默认没有
                  },
                },
              ],
              [
                {
                  type: 'label',
                  text: itemData.rose.data,
                  sortVal: itemData.roses,
                  key: 'roses',
                  classes: itemRoseClass(itemData.rose),
                },
              ],
              [
                {
                  text: itemData.high,
                },
              ],
              [
                {
                  text: itemData.low,
                },
              ],
              [
                {
                  text: itemData.vol,
                },
              ],
              [
                {
                  text: itemData.amount,
                },
              ],
            ],
          });
        }
      });
      emitter.emit('MARKET-DATA', marketDataList.sort((a, b) => a.sort - b.sort), initData);
    };

    const listenWSData = (data, headerSymbol, coinList, symbolAll) => {
      const { type, WsData } = data;
      // 24小时行情数据
      if (type === 'MARKET_DATA') {
        marketDataObj = WsData;
        setMarketData(coinList, symbolAll);
        setRecommendData(headerSymbol, coinList);
      }
      if (type.indexOf('KLINE_DATA') > -1) {
        if (headerSymbol.length) {
          headerSymbol.forEach((key) => {
            const [, symbolType] = WsData.channel.split('_');
            const symbolArr = key.toLowerCase().split('/');
            const symbol = symbolArr[0] + symbolArr[1];
            if (symbol === symbolType) {
              if (WsData.event_rep === 'rep') {
                const kData = WsData.data;
                klineDataList[key] = [];
                const lengthNumber = kData.slice(-20);
                lengthNumber.forEach((item) => {
                  klineDataList[key].push([
                    item.id,
                    item.close,
                  ]);
                });
              } else {
                const kData = WsData.tick;
                const keyYs = klineDataList[key] || [];
                const lengths = keyYs.length;
                if (klineDataList[key].length) {
                  const lastId = klineDataList[key][lengths - 1][0];
                  if (lastId === kData.id) {
                    klineDataList[key].pop();
                  }
                  if (klineDataList[key].length > 20) {
                    klineDataList[key].shift();
                  }
                  klineDataList[key].push([
                    kData.id,
                    kData.close,
                  ]);
                }
              }
            }
          });
          emitter.emit('RECOMMEEND_KLINE_DATA', klineDataList);
        }
        const symbolAllkey = Object.keys(symbolAll);
        if (symbolAllkey.length) {
          const AllklineDataList = {};
          symbolAllkey.forEach((key) => {
            const [, symbolType] = WsData.channel.split('_');
            const symbolArr = key.toLowerCase().split('/');
            const symbol = symbolArr[0] + symbolArr[1];
            if (symbol === symbolType) {
              if (WsData.event_rep === 'rep') {
                const kData = WsData.data;
                AllklineDataList[key] = [];
                const lengthNumber = kData.slice(-20);
                lengthNumber.forEach((item) => {
                  AllklineDataList[key].push([
                    item.id,
                    item.close,
                  ]);
                });
              }
            }
          });
          if (Object.keys(AllklineDataList).length) {
            emitter.emit('ALL_RECOMMEEND_KLINE_DATA', AllklineDataList);
          }
        }
      }
    };

    const getSymbolList = (currentMarketList, symbolAll) => {
      // 如果 当前市场 是 自选市场
      if (marketCurrent === 'myMarket') {
        const mySymbol = myStorage.get('mySymbol') || [];
        const marketList = {};
        if (mySymbol.length) {
          mySymbol.forEach((item) => {
            if (item && symbolAll[item]) {
              marketList[item] = symbolAll[item];
            }
          });
        }
        return marketList;
      }
      if (currentMarketList && marketCurrent) {
        return currentMarketList[marketCurrent];
      }
      return null;
    };

    const initWorker = (data) => {
      const { market, symbolAll } = data;
      const { coinList } = market;
      const symbolCurrent = myStorage.get('sSymbolName');
      emitter.emit('websocketReceive', {
        type: 'CREAT_WEBSOCKET',
        data: {
          wsUrl: market.wsUrl,
          lan: lang,
          rate: market.rate,
          symbolAll,
        },
      });

      emitter.on('websocketSend', (event) => {
        // eslint-disable-next-line no-shadow
        const { data, type } = event;
        const { headerSymbol } = market;
        // 监听 WebSocket 链接成功
        if (type === 'WEBSOCKET_ON_OPEN') {
          const symbolListKey = Object.keys(symbolList);
          const objData = {};
          symbolListKey.forEach((item) => {
            objData[item] = symbolList[item];
          });
          headerSymbol.forEach((item) => {
            if (symbolListKey.indexOf(item) < 0 && symbolAll[item]) {
              objData[item] = symbolAll[item];
            }
          });
          // 发送 24小时行情历史数据 Send
          webSocketSend('Review', null, symbolCurrent, symbolAll);
          // 发送 24小时行情实时数据 Send
          webSocketSend('Market', 'sub', symbolCurrent, objData);
          // 发送 推荐位 kline数据 Send
          if (headerSymbol.length) {
            headerSymbol.forEach((item) => {
              const symbolArr = item.toLowerCase().split('/');
              const symbol = symbolArr[0] + symbolArr[1];
              emitter.emit('websocketReceive', {
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'req',
                  lastTimeS: '1min',
                  lTime: false,
                  number: 100,
                  symbolCurrent: item,
                },
              });
              emitter.emit('websocketReceive', {
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'sub',
                  lastTimeS: '1min',
                  lTime: false,
                  symbolCurrent: item,
                },
              });
            });
          }
          const symbolAllkey = Object.keys(symbolAll);
          // 发送 全部币对的 kline 历史数据 Send
          if (symbolAllkey.length) {
            symbolAllkey.forEach((item) => {
              const symbolArr = item.toLowerCase().split('/');
              const symbol = symbolArr[0] + symbolArr[1];
              emitter.emit('websocketReceive', {
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'req',
                  lastTimeS: '1min',
                  lTime: false,
                  number: 100,
                  symbolCurrent: item,
                },
              });
              /*              emitter.emit('websocketReceive', {
                type: 'WEBSOCKET_KLINE_SEND',
                data: {
                  symbol,
                  type: 'sub',
                  lastTimeS: '1min',
                  lTime: false,
                  symbolCurrent: item,
                },
              }); */
            });
          }
        }
        // 监听 WS 数据
        if (type === 'WEBSOCKET_DATA') {
          listenWSData(data, headerSymbol, coinList, symbolAll);
        }
      });
    };
    const initFn = (data) => {
      setDefaultMarket(data.market);
      marketCurrent = myStorage.get('homeMarkTitle');
      symbolList = getSymbolList(data.market.market, data.symbolAll);
      if (data.market.coinTagLangs && data.market.coinTagLangs[lang]) {
        coinTagLangs = data.market.coinTagLangs[lang];
      }
      emitter.emit('send_market', data);
      initWorker(data);
      emitter.on('SWITCH-MARKET', (val) => {
        mySymbolList = myStorage.get('mySymbol') || [];
        marketCurrent = val;
        symbolList = getSymbolList(data.market.market, data.symbolAll);
        setMarketData(data.market.coinList, data.symbolAll, true);
      });
    };

    emitter.on('websocket-worker-ready', () => {
      if (window.market) {
        initFn(window.market);
      } else {
        emitter.on('getMarket', (data) => {
          initFn(data);
        });
      }
    });
  };
  getScript(window.websocketPath).then(() => {
    init();
  });
})();
