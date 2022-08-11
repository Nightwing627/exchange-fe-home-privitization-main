(() => {const { fixD, fixRate } = window.BlockChainUtils;
const setDepthData = function (symbol, data, rate, depthValue, lan) {
  const dataTypeKey = Object.keys(data);
  const priceFix = depthValue;
  const volumeFix = symbol.volume || 0;
  const names = symbol.name.split('/');
  const symbolName = names[0];
  const marketName = names[1] || symbol.quoteSymbol;
  const depthListData = {};
  let maxTotal = 0;

  dataTypeKey.forEach((item) => {
    if (item !== 'newData') {
      const objItem = data[item];
      let totalNum = 0;
      let maxval = 0;
      const dataArr = [];
      let objKeys = null;
      if (item === 'asks') {
        objKeys = Object.keys(objItem).sort((a, b) => a - b);
      } else {
        objKeys = Object.keys(objItem).sort((a, b) => b - a);
      }
      // console.log('itemKey', objKeys.length);
      // 去掉 价格为零的
      objKeys.forEach((itemKey, index) => {
        const itemArr = objItem[itemKey];
        if (Number(fixD(itemArr[1]), priceFix) !== 0 && dataArr.length < 150) {
          // 获取最大的数量
          maxval = maxval < itemArr[1] ? itemArr[1] : maxval;

          totalNum += itemArr[1];
          const ratePrice = fixRate(itemArr[0], rate, marketName, lan);
          const objd = {
            rate: ratePrice,
            total: fixD(totalNum, volumeFix),
            price: fixD(itemArr[0], priceFix),
            vol: fixD(itemArr[1], volumeFix),
            diff: itemArr[2],
          };
          // 处理增量数据
          if (data.newData && data.newData.indexOf(itemArr[0]) < 0) {
            objd.diff = 0;
          }
          dataArr.push(objd);
        }
      });

      depthListData[item] = dataArr;
      if (maxTotal < maxval) {
        maxTotal = maxval;
      }
    }
  });

  return {
    symbol: symbol.name,
    depthMaxNumber: maxTotal,
    asksData: depthListData.asks.reverse(),
    buyData: depthListData.buys,
  };
};
const currentData = [];
let pYname = null;
let aYname = '';
const setEchartsData = function (dataList, type, currentSymbol) {
  const volumeFix = currentSymbol.volume;
  const defaultThreshold = currentSymbol.defaultThreshold || 0.1;
  if (type === 'current') {
    pYname = currentSymbol.name;
    if (dataList) {
      currentData[0] = Number(dataList.price);
      currentData[1] = Number(dataList.vol);
    }
    return;
  }
  if (!type) {
    aYname = currentSymbol.name;
  }
  if (pYname !== aYname) return false;
  let middlePrice = currentData[0];
  // 完成累加
  const j = 0;
  let minval = null;
  let maxval = null;
  let yminval = null;
  let ymaxval = null;
  let buysArr = [];
  let asksArr = [];

  const asksKey = Object.keys(dataList.asks);
  const buysKey = Object.keys(dataList.buys);

  if (dataList && asksKey.length > 1 || buysKey.length > 1) {
    const EachartDat = {};
    const keyArr = Object.keys(dataList);
    keyArr.forEach((key) => {
      if (key !== 'newData') {
        let i = 0;
        EachartDat[key] = [];
        const objItem = dataList[key];
        const objKeys = key === 'asks' ? Object.keys(objItem).sort((a, b) => a - b) : Object.keys(objItem).sort((a, b) => b - a);
        objKeys.forEach((item, index) => {
          if (Number(objItem[item][1]) !== 0) {
            objItem[item][0] = Number(objItem[item][0]);
            objItem[item][1] = Number(fixD(objItem[item][1] + i, volumeFix));
            [, i] = objItem[item];
            EachartDat[key].push(objItem[item]);
          }
        });
      }
    });

    buysArr = EachartDat.buys.reverse();
    asksArr = EachartDat.asks;

    // minval = (buysArr[0] && buysArr[0][0]) || 0;
    // maxval = (asksArr.length && asksArr[asksArr.length - 1][0]) || 0;

    const buyMax = (buysArr.length && buysArr[buysArr.length - 1][0]) || 0;
    const asksMin = (asksArr[0] && asksArr[0][0]) || 0;
    if (!middlePrice || middlePrice === 0) {
      middlePrice = (buyMax + asksMin) / 2;
    }
    minval = middlePrice - middlePrice * defaultThreshold;
    maxval = middlePrice + middlePrice * defaultThreshold;

    buysArr = buysArr.filter((item) => item[0] >= minval);
    asksArr = asksArr.filter((item) => item[0] <= maxval);

    buysArr.length && buysArr.unshift([minval, buysArr[0][1]]);
    asksArr.length && asksArr.push([maxval, asksArr[asksArr.length - 1][1]]);

    const buySpks = minval === 0 ? 0 : (middlePrice - minval) / middlePrice;
    const askSpks = maxval === 0 ? 0 : (maxval - middlePrice) / middlePrice;

    let spks = 0.15;
    if (buySpks > spks && askSpks > spks) {
      spks = buySpks >= askSpks ? askSpks : buySpks;
    } else {
      spks = buySpks >= askSpks ? buySpks : askSpks;
    }
    spks > 1 && (spks = 1);

    // minval = middlePrice - (middlePrice * spks);
    // maxval = middlePrice + (middlePrice * spks);

    if (!buysArr.length && asksArr.length) {
      yminval = asksArr[0][1];
      ymaxval = asksArr[asksArr.length - 1][1];
    } else if (!asksArr.length && buysArr.length) {
      yminval = buysArr[buysArr.length - 1][1];
      ymaxval = buysArr[0][1];
    } else {
      yminval = buysArr[buysArr.length - 1][1] > asksArr[0][1] ? asksArr[0][1] : buysArr[buysArr.length - 1][1];
      ymaxval = buysArr[0][1] > asksArr[asksArr.length - 1][1] ? buysArr[0][1] : asksArr[asksArr.length - 1][1];
    }
  }
  return {
    buysArr,
    asksArr,
    minval,
    maxval,
    yminval,
    ymaxval,
  };
};

const oldData = {};
function dataTemplate(item, WSdata, rateData, oldObj, lan) {
  const names = item.name.split('/');
  const symbol = names[0];
  const unit = names[1];

  const showNames = item.showName ? item.showName.split('/') : null;
  const showSymbol = showNames ? showNames[0] : null;
  const showUnit = showNames ? showNames[1] : null;

  if (!WSdata.renew.length || WSdata.renew.indexOf(item.symbol.toLowerCase()) !== -1 || !oldData[item.name]) {
    const data = WSdata[item.symbol.toLowerCase()];
    const oldObj = oldData[item.name];
    const symbolItem = {};
    if (data) {
      const marketName = item.name.split('/')[1] || item.quoteSymbol;
      const priceFix = item.price || item.pricePrecision;
      const volumeFix = item.volume || 0;
      // 收盘价判断
      const oldClose = oldObj ? oldObj.closes : '';
      const close = fixD(data.close.toString(), priceFix);
      const cN = parseFloat(close);
      const ocN = parseFloat(oldClose);
      // 计算汇率
      let rate = 0;
      if (rateData) {
        rate = fixRate(data.close, rateData, marketName, lan);
      }
      // 最新价格 涨跌 颜色class
      let priceClass = '';
      if (ocN) {
        if (ocN > cN) {
          priceClass = 'u-4-cl';
        }
        if (ocN < cN) {
          priceClass = 'u-1-cl';
        }
      }
      // 涨跌幅判断
      const num = Math.abs(data.rose * 10000 / 100);
      let rose = null;
      let rc = null;
      if (!parseFloat(num)) {
        rose = '0.00%';
      } else {
        rose = `${Number(num.toString().match(/^\d+(?:\.\d{0,2})?/))}`;
        if (data.rose < 0) {
          rc = 'u-4-cl';
          rose = `-${rose}%`;
        }
        if (data.rose > 0) {
          rc = 'u-1-cl';
          rose = `+${rose}%`;
        }
        if (data.rose === 0) {
          rc = '';
          rose = '0.00%';
        }
      }
      if (showNames) {
        symbolItem.showSymbol = {
          symbol: showSymbol,
          unit: showUnit,
        };
      }
      symbolItem.symbol = {
        symbol,
        unit,
      };
      symbolItem.closes = close;
      symbolItem.close = {
        class: priceClass,
        data: close,
        price: rate,
      };
      symbolItem.roses = rose;
      symbolItem.rose = {
        class: rc,
        data: rose,
      };
      symbolItem.IsST = item.IsST || 0;
      symbolItem.newcoinFlag = item.newcoinFlag;
      symbolItem.sort = item.sort;
      symbolItem.name = item.name;
      symbolItem.multiple = item.multiple || '0';
      symbolItem.low = fixD(data.low, priceFix);
      symbolItem.vol = fixD(data.vol, volumeFix);
      symbolItem.high = fixD(data.high, priceFix);
      symbolItem.amount = fixD(data.amount, priceFix);
      symbolItem.holdAmount = fixD(data.holdAmount, priceFix);
      symbolItem.holdVolume = fixD(data.holdVolume, volumeFix);

      oldData[item.name] = symbolItem;
    } else {
      if (showNames) {
        symbolItem.showSymbol = {
          symbol: showSymbol,
          unit: showUnit,
        };
      }
      symbolItem.symbol = {
        symbol,
        unit,
      };
      symbolItem.closes = -99999;
      symbolItem.close = {
        class: '',
        data: '--',
        price: '--',
      };
      symbolItem.roses = -99999;
      symbolItem.rose = {
        class: '',
        data: '--',
      };
      symbolItem.isShow = true;
      symbolItem.amount = '--';
      symbolItem.low = '--';
      symbolItem.high = '--';
      symbolItem.vol = '--';
      symbolItem.name = item.name;
      symbolItem.sort = item.sort;
      symbolItem.IsST = item.IsST || 0;
      symbolItem.newcoinFlag = item.newcoinFlag;
      oldData[item.name] = symbolItem;
    }
    return symbolItem;
  }
  return oldData[item.name];
}
//  当前币对列表， 市场队列数据， 汇率单位
const setMarketData = function (symbolList, data, rateData, lan) {
  const marketData = {};
  const symbolsKeys = Object.keys(symbolList);
  symbolsKeys.forEach((item) => {
    if (symbolList[item].symbol) {
      const symbolkey = symbolList[item].symbol;
      const itemData = data[symbolkey] || '';
      marketData[item] = dataTemplate(symbolList[item], data, rateData, oldData[symbolkey], lan);
    }
  });
  return marketData;
};
const setTradeData = function (symbol, datalist, rateData, lan) {
  const tradeData = [];
  const queueData = [];
  if (datalist && datalist.length) {
    const priceFix = symbol.price || symbol.pricePrecision;
    const volumeFix = symbol.volume || 0;
    const marketName = symbol.name.split('/')[1];
    const keyArr = [];
    let num = 0;
    datalist.forEach((item, index) => {
      // 去重 截取150条 格式化
      // if (keyArr.indexOf(item.ts) === -1) {
      if (num < 150) {
        const rate = fixRate(item.price, rateData, marketName, lan);
        const nextprice = datalist[index + 1] ? datalist[index + 1].price : null;
        let rose = null;
        if (nextprice) {
          if (nextprice > item.price) {
            rose = 'down';
          } else if (nextprice < item.price) {
            rose = 'up';
          }
        }
        tradeData.push({
          side: item.side === 'SELL' ? 'u-4-cl' : 'u-1-cl',
          // time: item.ds.split(' ')[1],
          time: formatTime(item.ts).split(' ')[1],
          rate,
          ts: item.ts,
          price: fixD(item.price, priceFix),
          vol: fixD(item.vol, volumeFix),
          rose,
          date: new Date().getTime() + index,
          change: item.change,
        });
        keyArr.push(item.ts);
        queueData.push(item);
        num += 1;
      }
      // }
    });
    // 排序 并返回数据
    return {
      tradeData: tradeData.sort((a, b) => b.ts - a.ts),
      queueDataList: queueData,
    };
  }
  return {
    tradeData,
    queueDataList: queueData,
  };
};
const { emitte } = window;
const { getScript } = window.BlockChainUtils;
getScript(`${window.staticDomain}/home/static/js/pako.min.js`).then(() => {
    const sendMessage = function (type, subType, data) {
        emitter.emit('websocketSend', {
            type,
            data: {
                type: subType,
                WsData: data,
            },
        })
    };
    let webSocketUrl = null;
    let lan = null;
    let rate = null;
    let symbolAll = null;
    let symbolListArr = null;
    let depthValue = null;
    let MywebSocket = null;
// 当前选中的币对
    let currentSymbol = null;
// 24小时行情的数据队列
    let marketData = {
        renew: [],
    };
// 24小时行情 用来判断是否是第一次的数据
    let marketDataKey = [];
// 货币汇率单位
    const rateData = null;
// 24小时行情 队列延迟 时间
    const marketTime = {
        socketTime: 0, // 存储上一条数据的时间
        contrastTime: 500, // 对比时间
        outTime: 500, // 延迟推送时间
        timeOut: null, // timeOut
    };
// 实时成交数据队列
    let tradeData = null;
// 实时成交 队列延迟 时间
    const tradeTime = {
        socketTime: 0, // 存储上一条数据的时间
        contrastTime: 50, // 对比时间
        outTime: 50, // 延迟推送时间
        timeOut: null, // timeOut
    };
// 盘口 深度的 级别
    let curreentDepth = null;
// 盘口 深度 队列
    const tickData = {
        asks: '',
        buys: '',
    };
    const depthTime = {
        socketTime: 0, // 存储上一条数据的时间
        contrastTime: 45, // 对比时间
        outTime: 50, // 延迟推送时间
        timeOut: null, // timeOut
    };
// ECharts 深度 队列
    const echartsData = {};
    const echartsTime = {
        socketTime: 0, // 存储上一条数据的时间
        contrastTime: 50, // 对比时间
        outTime: 50, // 延迟推送时间
        timeOut: null, // timeOut
    };


    const marketReviewSend = function () {
        if (MywebSocket) {
            MywebSocket.send(JSON.stringify({
                event: 'req',
                params: {
                    channel: 'review',
                },
            }));
        }
    };
    const markteWsSend = function (type, symbolCurrent, symbolList) {
        if (symbolList && MywebSocket) {
            const symbolKeys = Object.keys(symbolList);
            symbolKeys.forEach((item) => {
                if (symbolList[item].symbol) {
                    const symbol = symbolList[item].symbol.toLowerCase();
                    let u = 1;
                    if (type === 'unsub' && item === symbolCurrent) {
                        u = 0;
                    } else {
                        u = 1;
                    }
                    if (MywebSocket && u) {
                        MywebSocket.send(
                            JSON.stringify(
                                {
                                    event: type,
                                    params: {
                                        channel: `market_${symbol}_ticker`,
                                        cb_id: symbol,
                                    },
                                },
                            ),
                        );
                    }
                }
            });
        }
    };
// 实时成交 WS 请求
    const tradeWsSend = function (type, symbolCurrent) {
        if (MywebSocket && symbolCurrent) {
            const symbolArr = symbolCurrent.toLowerCase().split('/');
            const symbol = symbolArr[1] ? symbolArr[0] + symbolArr[1] : symbolArr[0];
            const num = 100;
            MywebSocket.send(
                JSON.stringify(
                    {
                        event: type,
                        params: {
                            channel: `market_${symbol}_trade_ticker`,
                            cb_id: symbol,
                            top: num,
                        },
                    },
                ),
            );
        }
    };
// 盘口深度 WS 请求
    const depthWsSend = function (type, symbolCurrent, depth) {
        if (MywebSocket && symbolCurrent) {
            const symbolArr = symbolCurrent.toLowerCase().split('/');
            const symbol = symbolArr[1] ? symbolArr[0] + symbolArr[1] : symbolArr[0];
            MywebSocket.send(
                JSON.stringify(
                    {
                        event: type,
                        params: {
                            channel: `market_${symbol}_depth_step${depth}`,
                            cb_id: symbol,
                        },
                    },
                ),
            );
        }
    };
// tradingView 数据
    const klineWsSend = function (parameters) {
        const {type} = parameters;
        const {symbol} = parameters;
        const {lastTimeS} = parameters;
        const {lTime} = parameters;
        const {number} = parameters;
        const params = {
            channel: `market_${symbol}_kline_${lastTimeS}`,
            cb_id: symbol,
        };
        if (lTime) {
            params.endIdx = lTime;
            params.pageSize = number;
        }
        if (MywebSocket.readyState === 1) {
            MywebSocket.send(JSON.stringify({
                event: type,
                params,
            }));
        }
    };

    let timeoutTop = null;
    let lockReconnectTop = false;
    let lockDestroyTop = false;

    clearTimeout(timeoutTop);
// 心跳检测
    const heartCheckTop = function () {
        const timeout = 30000;
        if (MywebSocket.readyState !== 3) {
            clearTimeout(timeoutTop);
            if (!lockReconnectTop && !lockDestroyTop) {
                timeoutTop = setTimeout(() => {
                    console.log('未检测到心跳体征');
                    MywebSocket.send('1111');
                    MywebSocket.close();
                }, timeout);
            }
        }
    };
// 重连WS
    const reconnectTop = function (type) {
        if (!lockReconnectTop && !lockDestroyTop) {
            lockReconnectTop = true;
            setTimeout(() => {
                // console.log('开始执行WS重连操作');
                creatWebSocket(type);
            }, 3000);
        }
    };

    const creatWebSocket = function () {
        // console.log('开始链接WS');
        if (webSocketUrl) {
            MywebSocket = new WebSocket(webSocketUrl);
            MywebSocket.binaryType = 'arraybuffer';
            webSocketEvent();
            lockReconnectTop = false;
        }
    };

    let ii = 0;

    const webSocketEvent = function () {
        // WS 链接成功
        MywebSocket.onopen = function () {
            sendMessage('WEBSOCKET_ON_OPEN', MywebSocket.readyState);
            // console.log('WS链接成功');
            // 开始 心跳检测
            heartCheckTop();
        };
        MywebSocket.onclose = function (data) {
            reconnectTop();
            sendMessage('WEBSOCKET_ON_OPEN', false);
            // console.log('WS已关闭');
        };
        MywebSocket.onmessage = function (event) {
            if (!currentSymbol) {
                return false;
            }
            const symbolArr = currentSymbol.toLowerCase().split('/');
            const symbol = symbolArr[1] ? symbolArr[0] + symbolArr[1] : symbolArr[0];
            const ua = new Uint8Array(event.data);
            const data = JSON.parse(pako.inflate(ua, {to: 'string'}));
            let dtype;
            let symbolType;
            // 重置心跳检测
            heartCheckTop();
            if (data.ping) {
                // console.log('data.ping', data.ping);
                MywebSocket.send(JSON.stringify({pong: data.ping}));
            } else {
                // console.log(data);
                if (data.channel) {
                    if (symbolListArr.tradeType && symbolListArr.tradeType === 'contract') {
                        dtype = data.channel.split('_')[3];
                        symbolType = `${data.channel.split('_')[1]}_${data.channel.split('_')[2]}`;
                    } else {
                        dtype = data.channel.split('_')[2];
                        symbolType = data.channel.split('_')[1];
                    }
                }
                // 24小时行情 -- 全部历史数据
                if (data.channel === 'review') {
                    marketData = data.data;
                    marketData.renew = [];
                    marketDataKey = 'review';
                    const syAc = currentSymbol.split('/');
                    const sycurrentSymbol = `${syAc[0].toLowerCase()}${syAc[1].toLowerCase()}`;
                    if (marketData[sycurrentSymbol]) {
                        setEchartsData(marketData[sycurrentSymbol].close, 'current', symbolAll[currentSymbol]);
                    }
                    // console.log('24小时行情全部历史数据', data);
                    sendMessage(
                        'WEBSOCKET_DATA',
                        'MARKET_DATA',
                        setMarketData(symbolAll, marketData, rate, lan),
                    );
                }
                // 24小时行情 -- 实时数据
                if (data.tick && dtype === 'ticker') {
                    // console.log('24小时行情', data);
                    if (marketData.renew.indexOf(symbolType) === -1) {
                        marketData.renew.push(symbolType);
                    }
                    let isFirstMarketData = true;
                    if (marketDataKey.indexOf(symbolType) === -1 && marketDataKey !== 'review') {
                        // 用来判断是否是第一次的数据
                        marketDataKey.push(symbolType);
                    } else {
                        isFirstMarketData = false;
                    }
                    marketData[symbolType] = data.tick;
                    // 判断是否距离上次收到数据的时间
                    if (data.ts - marketTime.socketTime >= marketTime.contrastTime || isFirstMarketData) {
                        clearTimeout(marketTime.timeOut);
                        marketTime.socketTime = data.ts;
                        sendMessage(
                            'WEBSOCKET_DATA',
                            'MARKET_DATA',
                            setMarketData(symbolAll, marketData, rate, lan),
                        );
                        marketData.renew = [];
                    } else {
                        clearTimeout(marketTime.timeOut);
                        marketTime.timeOut = null;
                        marketTime.timeOut = setTimeout(() => {
                            sendMessage(
                                'WEBSOCKET_DATA',
                                'MARKET_DATA',
                                setMarketData(symbolAll, marketData, rate, lan),
                            );
                            marketData.renew = [];
                        }, marketTime.outTime);
                    }
                }
                // K线图数据
                if (data.channel && data.channel.indexOf('_kline_') > -1) {
                    if (data.event_rep && data.event_rep === 'rep') {
                        sendMessage('WEBSOCKET_DATA', 'KLINE_DATA_REQ', data);
                    } else {
                        sendMessage('WEBSOCKET_DATA', 'KLINE_DATA_SUB', data);
                    }
                }
                // 判断是否为当前货币对
                if (symbol === symbolType) {
                    // 盘口 深度 数据
                    if (data.tick && data.channel.indexOf('depth_step') !== -1) {
                        ii += 1;
                        // console.log('深度数据', data);
                        const depthClasses = `depth_step${curreentDepth}`;
                        const channelArr = data.channel.split('_');
                        const step = channelArr[channelArr.length - 1];
                        if (data.channel.indexOf(depthClasses) !== -1) {
                            // 增量数据
                            if (data.tick.side) {
                                const {tick} = data;
                                let diff = 1;
                                // 如果新的小于旧的
                                if (tickData[symbolType] && tickData[symbolType][tick.side][tick.price] && tickData[symbolType][tick.side][tick.price][1] > tick.volume) {
                                    diff = 2;
                                }
                                tickData[symbolType][tick.side][tick.price] = [tick.price, tick.volume, diff];

                                if (!tickData[symbolType].newData) {
                                    tickData[symbolType].newData = [tick.price];
                                } else if (tickData[symbolType].newData.indexOf(tick.price) < 0) {
                                    tickData[symbolType].newData.push(tick.price);
                                }
                                if (data.ts - depthTime.socketTime >= depthTime.contrastTime) {
                                    depthTime.socketTime = data.ts;
                                    clearTimeout(depthTime.timeOut);
                                    depthTime.timeOut = null;
                                    sendMessage(
                                        'WEBSOCKET_DATA',
                                        'DEPTH_DATA',
                                        setDepthData(symbolAll[currentSymbol], tickData[symbolType], rate, depthValue, lan),
                                    );

                                    if (step === 'step0') {
                                        sendMessage(
                                            'WEBSOCKET_DATA',
                                            'ECHARTS_DATA',
                                            setEchartsData(tickData[symbolType], false, symbolAll[currentSymbol]),
                                        );
                                    }
                                    tickData[symbolType].newData = [];
                                } else {
                                    clearTimeout(depthTime.timeOut);
                                    depthTime.timeOut = null;
                                    depthTime.timeOut = setTimeout(() => {
                                        sendMessage(
                                            'WEBSOCKET_DATA',
                                            'DEPTH_DATA',
                                            setDepthData(symbolAll[currentSymbol], tickData[symbolType], rate, depthValue, lan),
                                        );
                                        if (step === 'step0') {
                                            sendMessage(
                                                'WEBSOCKET_DATA',
                                                'ECHARTS_DATA',
                                                setEchartsData(tickData[symbolType], false, symbolAll[currentSymbol]),
                                            );
                                        }
                                        tickData[symbolType].newData = [];
                                    }, depthTime.outTime);
                                }
                            } else {
                                // 全量数据
                                // console.log('全');
                                if (data.tick.asks === null) data.tick.asks = [];
                                if (data.tick.buys === null) data.tick.buys = [];
                                tickData[symbolType] = {
                                    asks: {},
                                    buys: {},
                                };
                                data.tick.asks.forEach((item) => {
                                    tickData[symbolType].asks[item[0]] = item;
                                });
                                data.tick.buys.forEach((item) => {
                                    tickData[symbolType].buys[item[0]] = item;
                                });
                                sendMessage(
                                    'WEBSOCKET_DATA',
                                    'DEPTH_DATA',
                                    setDepthData(symbolAll[currentSymbol], tickData[symbolType], rate, depthValue, lan),
                                );
                                if (step === 'step0') {
                                    sendMessage(
                                        'WEBSOCKET_DATA',
                                        'ECHARTS_DATA',
                                        setEchartsData(tickData[symbolType], false, symbolAll[currentSymbol]),
                                    );
                                }
                            }
                        }
                    }
                    // 实时成交 数据
                    if (dtype === 'trade') {
                        // console.log('实时成交', data);
                        //  最新成交历史数据
                        if (data.event_rep === 'rep') {
                            setEchartsData(data.data[0], 'current', symbolAll[currentSymbol]);
                            const tradeDataRep = setTradeData(symbolAll[currentSymbol], data.data, rate, lan);
                            tradeData = tradeDataRep.tradeData;
                            sendMessage('WEBSOCKET_DATA', 'TRADE_DATA', tradeDataRep);
                        }
                        // 最新成交 实时数据
                        if (data.tick && data.tick.data.length) {
                            tradeData.forEach((item) => {
                                item.change = 0;
                            });
                            data.tick.data.forEach((item) => {
                                item.change = 1;
                                tradeData.unshift(item);
                            });
                            if (marketData.renew.indexOf('symbolType') === -1) {
                                marketData.renew.push('symbolType');
                            }
                            // 判断距离上次收到数据的时间 是否大于阈值
                            if (data.ts - tradeTime.socketTime >= tradeTime.contrastTime) {
                                clearTimeout(tradeTime.timeOut);
                                tradeTime.socketTime = data.ts;
                                marketData[symbolType].close = tradeData[0] ? tradeData[0].price : '';
                                marketData.renew = [symbolType];
                                setEchartsData(tradeData[0], 'current', symbolAll[currentSymbol]);
                                sendMessage(
                                    'WEBSOCKET_DATA',
                                    'MARKET_DATA',
                                    setMarketData(symbolAll, marketData, rate, lan),
                                );
                                sendMessage(
                                    'WEBSOCKET_DATA',
                                    'TRADE_DATA',
                                    setTradeData(symbolAll[currentSymbol], tradeData, rate, lan),
                                );
                            } else {
                                clearTimeout(tradeTime.timeOut);
                                tradeTime.timeOut = null;
                                tradeTime.timeOut = setTimeout(() => {
                                    marketData[symbolType].close = tradeData[0] ? tradeData[0].price : '';
                                    setEchartsData(tradeData[0], 'current', symbolAll[currentSymbol]);
                                    sendMessage(
                                        'WEBSOCKET_DATA',
                                        'MARKET_DATA',
                                        setMarketData(symbolAll, marketData, rate, lan),
                                    );
                                    sendMessage(
                                        'WEBSOCKET_DATA',
                                        'TRADE_DATA',
                                        setTradeData(symbolAll[currentSymbol], tradeData, rate, lan),
                                    );
                                }, tradeTime.outTime);
                            }
                        }
                    }
                }
            }
        };
    };
// 关闭WS
    const closeWebSocket = function () {
        // 设置 禁止在重连
        lockDestroyTop = true;
        clearTimeout(timeoutTop);
        MywebSocket.close();
    };
// 监听 发送send
    const webSocketSend = function (parameters) {
        // 存储当前货币对
        const {type} = parameters;
        const {sendType} = parameters;
        const {symbolData} = parameters;
        const {symbolList} = parameters;
        depthValue = parameters.depthValue;
        currentSymbol = symbolData;

        // 24小时行情 历史全部数据
        if (type === 'Review') {
            marketReviewSend();
        }

        // 24小时行情 实时数据
        if (type === 'Market' && symbolData && symbolList) {
            markteWsSend(sendType, symbolData, symbolList);
            symbolListArr = symbolList;
        }

        // 实时成交数据 Send
        if (type === 'Trade' && symbolData) {
            tradeWsSend(sendType, symbolData);
        }

        // 盘口数据 Send
        if (type === 'Depth' && symbolData) {
            curreentDepth = symbolList;
            depthWsSend(sendType, symbolData, curreentDepth);
        }
    };
    emitter.on('websocketReceive', (event) => {
        const {data, type} = event;
        // 监听 创建 WS
        if (type === 'CREAT_WEBSOCKET') {
            if (!MywebSocket) {
                console.log(data)
                webSocketUrl = data.wsUrl;
                lan = data.lan;
                rate = data.rate;
                symbolAll = data.symbolAll;
                creatWebSocket(data.wsUrl);
            } else {
                sendMessage('WEBSOCKET_ON_OPEN', MywebSocket.readyState);
            }
        }
        if (type === 'CLOSE_WEBSOCKET') {
            closeWebSocket(data);
        }
        // 发送 send
        if (type === 'WEBSOCKET_SEND') {
            if (MywebSocket.readyState === 1) {
                webSocketSend(data);
            }
        }
        // 发送 kline send
        if (type === 'WEBSOCKET_KLINE_SEND') {
            symbolCurrent = data.symbolCurrent;
            klineWsSend(data);
        }
        // 实时成交的队列 替换成处理过的
        if (type === 'TRADE_QUEUE_DATA') {
            tradeData = data;
        }
    });

    emitter.emit('websocket-worker-ready');

});
})()