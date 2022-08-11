var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if('value'in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}(function(){var _window$BlockChainUti=window.BlockChainUtils,getScript=_window$BlockChainUti.getScript,myStorage=_window$BlockChainUti.myStorage,colorMap=_window$BlockChainUti.colorMap;var RecommendExtend=function(){function RecommendExtend(){_classCallCheck(this,RecommendExtend)}_createClass(RecommendExtend,[{key:'init',value:function init(){var _this=this;this.$recommendWrap=this.$recommend.querySelector('.recommend-wrap');this.$recommendContent=Array.prototype.slice.call(this.$recommend.querySelectorAll('.recommend-content'));this.len=this.$recommendContent.length;this.klineColor='#24a0f5';this.lineWidth=2;this.dataList=[];this.myEcharts={};this.kLineIniting={};this.labelisShow=false;this.klinkInit={};this.echartReady={};this.klineDataList={};this.klineTimer={};this.domTree={};this.classMap={};this.timer=null;this.scrollRG=0;this.clientWidths=document.body.offsetWidth;var width=this.liItemWidth*this.$recommendContent.length;this.itemWidth=this.len/2*this.liItemWidth-20;if(this.$recommend.querySelector('.cloned')){this.$recommendContent=Array.prototype.slice.call(this.$recommend.querySelectorAll('.recommend-content'));width=this.liItemWidth*this.$recommendContent.length;this.addKeyFrames(width/2);this.$recommendWrap.classList.add('play');this.isScroll=true}if(this.setWarpWdith){this.$recommendWrap.style.width=width+'px'}this.$prev=this.$recommend.querySelector('.prev');this.$next=this.$recommend.querySelector('.next');this.clientWidths=document.body.offsetWidth;this.scrollMax=this.len*this.liItemWidth-this.clientWidths;this.itemWidth=this.len*this.liItemWidth-20;this.$recommendWrap.style.display='block';this.$recommendContent.forEach(function(item){var coin=item.dataset.coin;if(coin){if(!_this.domTree[coin]){_this.domTree[coin]={};_this.classMap[coin]=''}_this.domTree[coin].percentage=item.querySelector('.percentage');_this.domTree[coin].recommendPrice=item.querySelector('.recommendPrice');_this.domTree[coin].recommendTime=item.querySelector('.recommendTime');_this.domTree[coin]['coin-text']=item.querySelector('.coin-text');_this.domTree[coin]['coin-label']=item.querySelector('.coin-label');_this.domTree[coin]['echart-box']=item.querySelector('.echart-box');if(_this.domTree[coin].percentage){_this.classMap[coin]=_this.domTree[coin].percentage.className}}});if(this.$recommendWrap&&this.$recommendWrap.dataset.style){var dataStyle=JSON.parse(this.$recommendWrap.dataset.style);Object.keys(dataStyle).forEach(function(item){_this.$recommendWrap.style[item]=dataStyle[item]})}if(this.itemWidth>this.clientWidths&&!this.isScroll){if(this.$next){this.$next.style.display='block'}}if(!window.echarts){getScript(''+this.echartsPath).then(function(){if(!Object.keys(_this.myEcharts).length){var keys=Object.keys(_this.klineDataList);if(keys.length){_this.$recommendContent.forEach(function(target){var coin=target.dataset.coin;console.log('target.dataset',target.dataset);var coinC=coin.replace('-c','');if(!_this.klineTimer[coinC]){_this.klineTimer[coinC]=null}_this.klineTimer[coinC]=setTimeout(function(){_this.initEcharts(coinC)},0)})}}})}window.emitter.on('RECOMMEEND_KLINE_DATA',function(data){_this.resloveKline(data)});window.emitter.on('RECOMMEEND_DATA',function(data){_this.resloveRecommendData(data)});window.emitter.on('resize',function(){_this.clientWidths=document.body.offsetWidth});this.bindEvent()}},{key:'resloveKline',value:function resloveKline(data){var _this2=this;if(JSON.stringify(data)===JSON.stringify(this.klineDataList)){return}this.klineDataList=JSON.parse(JSON.stringify(data));console.log('klineDataList',this.klineDataList);data=null;this.$recommendContent.forEach(function(target){var coin=target.dataset.coin;if(!_this2.klineTimer[coin]){_this2.klineTimer[coin]=null}if(_this2.echartReady[coin]){_this2.klineTimer[coin]=setTimeout(function(){_this2.setData(coin)},0)}else if(window.echarts&&!_this2.klinkInit[coin]&&!_this2.kLineIniting[coin]){_this2.klineTimer[coin]=setTimeout(function(){_this2.initEcharts(coin)},0)}})}},{key:'resloveRecommendData',value:function resloveRecommendData(data){var _this3=this;console.log('resloveRecommendData',data);var recommendDataList=data.recommendDataList,coinList=data.coinList,coinTagLangs=data.coinTagLangs;var keys=Object.keys(recommendDataList);keys.forEach(function(item){var coinLabel=recommendDataList[item]&&recommendDataList[item].symbol?_this3.getCoinLabel(recommendDataList[item].symbol.symbol,coinList,coinTagLangs):'';recommendDataList[item].coinLabel=coinLabel});this.dataList=recommendDataList;this.$recommendContent.forEach(function(item,index){var coin=item.dataset.coin;var coinC=coin.replace('-c','');var coinLabel=_this3.dataList[coinC].coinLabel;var len=_this3.$recommendContent.length;var recommendTimeVal='';if(_this3.dataList[coinC]){var $percentage=_this3.domTree[coin].percentage;var $recommendType=_this3.domTree[coin].recommendPrice;var $recommendTime=_this3.domTree[coin].recommendTime;if($recommendTime){recommendTimeVal=$recommendTime.innerHTML}var recommendTimeNVal='24H Vol <span>'+(_this3.dataList[coinC].vol?_this3.dataList[coinC].vol:'')+'</span>';var recommendTypeVal=$recommendType.innerHTML;var recommendTypeNVal=_this3.dataList[coinC].close?_this3.dataList[coinC].close.data:'';var percentageValue=$percentage.innerHTML;var percentageClass=$percentage.className;var percentageNValue=_this3.dataList[coinC].rose?_this3.dataList[coinC].rose.data:'';var percentageNClass=_this3.classMap[coin]+' '+(_this3.dataList[coinC].rose?_this3.dataList[coinC].rose.class:'');if(recommendTimeVal&&recommendTimeVal!==recommendTimeNVal){$recommendTime.innerHTML=recommendTimeNVal}if(recommendTypeVal!==recommendTypeNVal){$recommendType.innerHTML=recommendTypeNVal}if(percentageValue!==percentageNValue){$percentage.innerHTML=percentageNValue}if(percentageClass!==percentageNClass){$percentage.className=percentageNClass+' rose'}}if(!_this3.labelisShow){_this3.labelShow(coinLabel,coin,len,index)}})}},{key:'addKeyFrames',value:function addKeyFrames(y){var style=document.createElement('style');style.type='text/css';var keyFrames='\n    @-webkit-keyframes rowup {\n        0% {\n            -webkit-transform: translate3d(-620px, 0, 0);\n            transform: translate3d(-620px, 0, 0);\n        }\n        100% {\n            -webkit-transform: translate3d(-'+y+'px, 0, 0);\n            transform: translate3d(-'+y+'px, 0, 0);\n        }\n    }\n    @keyframes rowup {\n        0% {\n            -webkit-transform: translate3d(-620px, 0, 0);            transform: translate3d(-620px, 0, 0);        }\n        100% {\n            -webkit-transform: translate3d(-'+y+'px, 0, 0);            transform: translate3d(-'+y+'px, 0, 0);        }\n    }';style.innerHTML=keyFrames;document.getElementsByTagName('head')[0].appendChild(style)}},{key:'bindEvent',value:function bindEvent(){var _this4=this;if(this.isScroll){this.$recommendWrap.addEventListener('mouseenter',function(){_this4.$recommendWrap.classList.add('pause')});this.$recommendWrap.addEventListener('mouseleave',function(){_this4.$recommendWrap.classList.remove('pause')})}this.$recommendContent.forEach(function(item){item.addEventListener('click',function(){var coin=item.dataset.coin;if(coin){myStorage.set('sSymbolName',coin);myStorage.set('markTitle',coin.split('/')[1])}window.location.href='/trade/'+coin.replace('/','_')},false)});if(this.$next){this.$next.addEventListener('click',function(){var str=_this4.$recommendWrap.style.transform.match(/[(](.+)[)]/g)[0];str=str.replace('(','');str=str.replace(')','');var num=_this4.clientWidths/2;var x=Math.abs(str.replace('px','').split(',')[0]);var right=num+x;if(right>_this4.scrollMax-30){right=_this4.scrollMax}if(right===_this4.scrollMax){_this4.$next.style.display='none'}_this4.goPage(-right);_this4.$prev.style.display='block'},false);this.$prev.addEventListener('click',function(){var str=_this4.$recommendWrap.style.transform.match(/[(](.+)[)]/g)[0];str=str.replace('(','');str=str.replace(')','');var num=_this4.clientWidths/2;var x=Math.abs(str.replace('px','').split(',')[0]);var left=num-x;if(left>-30){left=0}_this4.$next.style.display='block';if(left===0){_this4.$prev.style.display='none'}_this4.goPage(left)},false)}}},{key:'goPage',value:function goPage(num){this.$recommendWrap.style.transform='translate3d('+num+'px,0,0)'}},{key:'setData',value:function setData(coin){var coinC=coin.replace('-c','');var color=this.klineColor;if(this.roseConfig){if(this.dataList[coinC]){if(this.dataList[coinC].rose){if(this.dataList[coinC].rose.class){color=colorMap[this.dataList[coinC].rose.class]}}}}if(this.cusKlineColor){color=this.cusKlineColor}if(this.cusTomKline){this.cusTomKline(color,coinC)}var lineWidth=this.lineWidth;if(this.cusLineWidth){lineWidth=this.cusLineWidth}var data=null;if(this.klineDataList[coinC]){data=JSON.parse(JSON.stringify(this.klineDataList[coinC]))}this.myEcharts[coin].resize();this.myEcharts[coin].setOption({series:[{data:data,type:'line',lineStyle:{normal:{color:color,width:lineWidth}}}]});data=null}},{key:'initEcharts',value:function initEcharts(coin){var _this5=this;if(this.ish5)return;var coinC=coin.replace('-c','');var color=this.klineColor;if(this.dataList[coinC]){if(this.dataList[coinC].rose){if(this.dataList[coinC].rose.class){color=colorMap[this.dataList[coinC].rose.class]}}}if(this.cusKlineColor){color=this.cusKlineColor}if(this.cusTomKline){this.cusTomKline(color,coin)}this.kLineIniting[coin]=true;var bg=null;if(this.haveBg){bg={normal:{color:new window.echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(36,160,245,0.2)'},{offset:1,color:'rgba(36,160,245,0.05)'}])}}}this.myEcharts[coin]=window.echarts.init(this.domTree[coin]['echart-box']);this.myEcharts[coin].setOption({grid:{left:-10,bottom:0,top:0,right:-10},xAxis:{show:false,type:'category',min:'dataMin',max:'dataMax'},yAxis:{show:false,type:'value',min:'dataMin',max:'dataMax'},series:[{data:[],type:'line',symbol:'none',lineStyle:{normal:{color:color,width:2}},areaStyle:bg}]});this.klineTimer[coin]=setTimeout(function(){_this5.setData(coin)},0);this.kLineIniting[coin]=false;this.klinkInit[coin]=true;this.echartReady[coin]=true}},{key:'getCoinLabel',value:function getCoinLabel(name){var coinList=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};var coinTagLangs=arguments[2];if(coinList&&coinList[name.toUpperCase()]){var _coinList$name$toUppe=coinList[name.toUpperCase()].coinTag,coinTag=_coinList$name$toUppe===undefined?'':_coinList$name$toUppe;return coinTag?coinTagLangs[coinTag]:''}return''}},{key:'labelShow',value:function labelShow(coinLabel,coin,len,index){if(this.domTree[coin]['coin-text']){if(coinLabel){this.domTree[coin]['coin-text'].innerHTML=coinLabel;this.domTree[coin]['coin-label'].style.display='inline-block'}if(index===len-1){this.labelisShow=true}}}}]);return RecommendExtend}();window.RecommendExtend=RecommendExtend})();