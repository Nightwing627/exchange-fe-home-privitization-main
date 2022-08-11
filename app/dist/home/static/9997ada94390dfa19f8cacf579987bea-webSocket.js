var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break}}catch(err){_d=true;_e=err}finally{try{if(!_n&&_i['return'])_i['return']()}finally{if(_d)throw _e}}return _arr}return function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i)}else{throw new TypeError('Invalid attempt to destructure non-iterable instance')}}}();(function(){var _window$BlockChainUti=window.BlockChainUtils,myStorage=_window$BlockChainUti.myStorage,setDefaultMarket=_window$BlockChainUti.setDefaultMarket,getCoinShowName=_window$BlockChainUti.getCoinShowName,getScript=_window$BlockChainUti.getScript;var lang=window.location.href.match(/[a-z]+_[A-Z]+/)[0];var recommendDataList={};var marketDataObj=[];var klineDataList={};var mySymbolList=myStorage.get('mySymbol')||[];var symbolList=[];var coinTagLangs={};var _window=window,emitter=_window.emitter;var marketCurrent=myStorage.get('homeMarkTitle');var init=function init(){var webSocketSend=function webSocketSend(type,sendType,symbolData){emitter.emit('websocketReceive',{type:'WEBSOCKET_SEND',data:{type:type,sendType:sendType,symbolData:symbolData,symbolList:symbolList}})};var setRecommendData=function setRecommendData(headerSymbol,coinList){if(headerSymbol.length){headerSymbol.forEach(function(item){recommendDataList[item]={};if(marketDataObj&&marketDataObj[item]){recommendDataList[item]=JSON.parse(JSON.stringify(marketDataObj[item]))}});window.emitter.emit('RECOMMEEND_DATA',{recommendDataList:recommendDataList,coinList:coinList,coinTagLangs:coinTagLangs})}};var myMarketIcon=function myMarketIcon(symbol){if(mySymbolList.indexOf(symbol)===-1){return'<svg class="icon icon-16" aria-hidden="true">\n                <use xlink:href="#icon-c_11">\n              </use></svg>'}return'<svg class="icon icon-16" aria-hidden="true">\n                <use xlink:href="#icon-c_11_1">\n              </use></svg>'};var getCoinLabel=function getCoinLabel(name){var coinList=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};if(coinList&&coinList[name.toUpperCase()]){var _coinList$name$toUppe=coinList[name.toUpperCase()].coinTag,coinTag=_coinList$name$toUppe===undefined?'':_coinList$name$toUppe;return coinTag?coinTagLangs[coinTag]:''}return''};var itemRoseClass=function itemRoseClass(rose){var bgClass=null;if(rose.class==='u-1-cl'){bgClass='rose-label u-3-bg'}else if(rose.class==='u-4-cl'){bgClass='rose-label u-6-bg'}return[rose.class,bgClass]};var setMarketData=function setMarketData(coinList,symbolAll,initData){if(!symbolList)return;var marketDataList=[];var keyarr=Object.keys(symbolList);keyarr.forEach(function(item){var itemData=marketDataObj[item];if(itemData){var showName=getCoinShowName(itemData.name,symbolAll);var coinLabel=getCoinLabel(itemData.symbol.symbol,coinList);var iconSvg='<span>'+showName+'</span>';if(coinLabel&&Number(window.coinTagOpen)){var str='<div class="coin-label">\n              <span class="coin-text a-12-cl">'+coinLabel+'</span>\n              <span class="coin-bg a-12-bg"></span>\n            </div>';iconSvg=''+iconSvg+str}marketDataList.push({isShow:symbolList[item].isShow,id:itemData.name,showName:showName,data:[[{iconSvg:myMarketIcon(itemData.name),type:'icon',eventType:'store'},{iconSvg:iconSvg,type:'icon',eventType:'symbol',classes:'symbolName',sortVal:itemData.sort,key:'sort'}],[{text:itemData.close.data,classes:['fontSize14'],sortVal:itemData.closes,key:'closes',subContent:{text:itemData.close.price!=='--'?'\u2248 '+itemData.close.price:itemData.close.price,classes:['b-2-cl']}}],[{type:'label',text:itemData.rose.data,sortVal:itemData.roses,key:'roses',classes:itemRoseClass(itemData.rose)}],[{text:itemData.high}],[{text:itemData.low}],[{text:itemData.vol}],[{text:itemData.amount}]]})}});emitter.emit('MARKET-DATA',marketDataList.sort(function(a,b){return a.sort-b.sort}),initData)};var listenWSData=function listenWSData(data,headerSymbol,coinList,symbolAll){var type=data.type,WsData=data.WsData;if(type==='MARKET_DATA'){marketDataObj=WsData;setMarketData(coinList,symbolAll);setRecommendData(headerSymbol,coinList)}if(type.indexOf('KLINE_DATA')>-1){if(headerSymbol.length){headerSymbol.forEach(function(key){var _WsData$channel$split=WsData.channel.split('_'),_WsData$channel$split2=_slicedToArray(_WsData$channel$split,2),symbolType=_WsData$channel$split2[1];var symbolArr=key.toLowerCase().split('/');var symbol=symbolArr[0]+symbolArr[1];if(symbol===symbolType){if(WsData.event_rep==='rep'){var kData=WsData.data;klineDataList[key]=[];var lengthNumber=kData.slice(-20);lengthNumber.forEach(function(item){klineDataList[key].push([item.id,item.close])})}else{var _kData=WsData.tick;var keyYs=klineDataList[key]||[];var lengths=keyYs.length;if(klineDataList[key].length){var lastId=klineDataList[key][lengths-1][0];if(lastId===_kData.id){klineDataList[key].pop()}if(klineDataList[key].length>20){klineDataList[key].shift()}klineDataList[key].push([_kData.id,_kData.close])}}}});emitter.emit('RECOMMEEND_KLINE_DATA',klineDataList)}var symbolAllkey=Object.keys(symbolAll);if(symbolAllkey.length){var AllklineDataList={};symbolAllkey.forEach(function(key){var _WsData$channel$split3=WsData.channel.split('_'),_WsData$channel$split4=_slicedToArray(_WsData$channel$split3,2),symbolType=_WsData$channel$split4[1];var symbolArr=key.toLowerCase().split('/');var symbol=symbolArr[0]+symbolArr[1];if(symbol===symbolType){if(WsData.event_rep==='rep'){var kData=WsData.data;AllklineDataList[key]=[];var lengthNumber=kData.slice(-20);lengthNumber.forEach(function(item){AllklineDataList[key].push([item.id,item.close])})}}});if(Object.keys(AllklineDataList).length){emitter.emit('ALL_RECOMMEEND_KLINE_DATA',AllklineDataList)}}}};var getSymbolList=function getSymbolList(currentMarketList,symbolAll){if(marketCurrent==='myMarket'){var mySymbol=myStorage.get('mySymbol')||[];var marketList={};if(mySymbol.length){mySymbol.forEach(function(item){if(item&&symbolAll[item]){marketList[item]=symbolAll[item]}})}return marketList}if(currentMarketList&&marketCurrent){return currentMarketList[marketCurrent]}return null};var initWorker=function initWorker(data){var market=data.market,symbolAll=data.symbolAll;var coinList=market.coinList;var symbolCurrent=myStorage.get('sSymbolName');emitter.emit('websocketReceive',{type:'CREAT_WEBSOCKET',data:{wsUrl:market.wsUrl,lan:lang,rate:market.rate,symbolAll:symbolAll}});emitter.on('websocketSend',function(event){var data=event.data,type=event.type;var headerSymbol=market.headerSymbol;if(type==='WEBSOCKET_ON_OPEN'){var symbolListKey=Object.keys(symbolList);var objData={};symbolListKey.forEach(function(item){objData[item]=symbolList[item]});headerSymbol.forEach(function(item){if(symbolListKey.indexOf(item)<0&&symbolAll[item]){objData[item]=symbolAll[item]}});webSocketSend('Review',null,symbolCurrent,symbolAll);webSocketSend('Market','sub',symbolCurrent,objData);if(headerSymbol.length){headerSymbol.forEach(function(item){var symbolArr=item.toLowerCase().split('/');var symbol=symbolArr[0]+symbolArr[1];emitter.emit('websocketReceive',{type:'WEBSOCKET_KLINE_SEND',data:{symbol:symbol,type:'req',lastTimeS:'1min',lTime:false,number:100,symbolCurrent:item}});emitter.emit('websocketReceive',{type:'WEBSOCKET_KLINE_SEND',data:{symbol:symbol,type:'sub',lastTimeS:'1min',lTime:false,symbolCurrent:item}})})}var symbolAllkey=Object.keys(symbolAll);if(symbolAllkey.length){symbolAllkey.forEach(function(item){var symbolArr=item.toLowerCase().split('/');var symbol=symbolArr[0]+symbolArr[1];emitter.emit('websocketReceive',{type:'WEBSOCKET_KLINE_SEND',data:{symbol:symbol,type:'req',lastTimeS:'1min',lTime:false,number:100,symbolCurrent:item}})})}}if(type==='WEBSOCKET_DATA'){listenWSData(data,headerSymbol,coinList,symbolAll)}})};var initFn=function initFn(data){setDefaultMarket(data.market);marketCurrent=myStorage.get('homeMarkTitle');symbolList=getSymbolList(data.market.market,data.symbolAll);if(data.market.coinTagLangs&&data.market.coinTagLangs[lang]){coinTagLangs=data.market.coinTagLangs[lang]}emitter.emit('send_market',data);initWorker(data);emitter.on('SWITCH-MARKET',function(val){mySymbolList=myStorage.get('mySymbol')||[];marketCurrent=val;symbolList=getSymbolList(data.market.market,data.symbolAll);setMarketData(data.market.coinList,data.symbolAll,true)})};emitter.on('websocket-worker-ready',function(){if(window.market){initFn(window.market)}else{emitter.on('getMarket',function(data){initFn(data)})}})};getScript(window.websocketPath).then(function(){init()})})();