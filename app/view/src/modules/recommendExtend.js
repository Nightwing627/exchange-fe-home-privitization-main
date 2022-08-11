(() => {
  const { getScript, myStorage } = window.BlockChainUtils;
  class RecommendExtend {
    init(){
      this.$recommend = document.querySelector('#recommend');
      this.$recommendWrap = this.$recommend.querySelector('.recommend-wrap');
      this.$recommendContent = this.$recommend.querySelectorAll('.recommend-content');
      this.len = this.$recommendContent.length;
      this.klineColor = '#24a0f5';
      this.lineWidth = 2;
      this.dataList = [];
      this.myEcharts = {};
      this.kLineIniting = {};
      this.labelisShow = false;
      this.klinkInit = {};
      this.echartReady = {};
      this.klineDataList = {};
      this.klineTimer = {};
      this.domTree = {};
      this.$prev = this.$recommend.querySelector('.prev');
      this.$next = this.$recommend.querySelector('.next');
      this.clientWidths = document.body.clientWidth;
      this.scrollMax = this.len * 300 - this.clientWidths;
      this.itemWidth = this.len * 300 - 20;
      this.$recommendContent.forEach((item) => {
        const coin = item.dataset.coin;
        if (!this.domTree[coin]) {
          this.domTree[coin] = {};
        }
        this.domTree[coin]['percentage'] = item.querySelector('.percentage');
        this.domTree[coin]['recommendPrice'] = item.querySelector('.recommendPrice');
        this.domTree[coin]['recommendTime'] = item.querySelector('.recommendTime');
        this.domTree[coin]['coin-text'] = item.querySelector('.coin-text');
        this.domTree[coin]['coin-label'] = item.querySelector('.coin-label');
        this.domTree[coin]['echart-box'] = item.querySelector('.echart-box');
      });
      const dataStyle = JSON.parse(this.$recommendWrap.dataset.style);
      Object.keys(dataStyle).forEach((item) => {
        this.$recommendWrap.style[item] = dataStyle[item];
      });
      if (this.itemWidth > this.clientWidths){
        this.$next.style.display = 'block';
      }
      if (!window.echarts) {
        getScript(`${this.echartsPath}`).then(() => {
          if (!Object.keys(this.myEcharts).length) {
            const keys = Object.keys(this.klineDataList);
            if (keys.length){
              keys.forEach((coin) => {
                if (!this.klineTimer[coin]) {
                  this.klineTimer[coin] = null;
                }
                this.klineTimer[coin] = setTimeout(() => {
                  this.initEcharts(coin);
                }, 0);
              });

            }
          }
        });
      }

      window.emitter.on('RECOMMEEND_KLINE_DATA', (data) => {
        this.klineDataList = data;
        const keys = Object.keys(this.klineDataList);
        keys.forEach((coin) => {
          if (!this.klineTimer[coin]) {
            this.klineTimer[coin] = null;
          }
          if (this.echartReady[coin]) {
            this.klineTimer[coin] = setTimeout(() => {
              this.setData(coin);
            }, 0);
          } else {
            if (window.echarts && !this.klinkInit[coin] && !this.kLineIniting[coin]) {
              this.klineTimer[coin] = setTimeout(() => {
                this.initEcharts(coin);
              }, 0);
            }
          }
        });

      });
      window.emitter.on('RECOMMEEND_DATA', (data) => {
        const {recommendDataList, coinList, coinTagLangs} = data;
        const keys = Object.keys(recommendDataList);
        keys.forEach((item) => {
          const coinLabel = (recommendDataList[item] && recommendDataList[item].symbol)
            ? this.getCoinLabel(recommendDataList[item].symbol.symbol, coinList, coinTagLangs)
            : '';
          recommendDataList[item]['coinLabel'] = coinLabel
        });
        this.dataList = recommendDataList;
        this.$recommendContent.forEach((item, index) => {
          const coin = item.dataset.coin;
          const coinLabel = this.dataList[coin].coinLabel;
          const len = this.$recommendContent.length;
          if (this.dataList[coin]) {
            const $percentage = this.domTree[coin]['percentage'];
            const $recommendType = this.domTree[coin]['recommendPrice'];
            const $recommendTime = this.domTree[coin]['recommendTime'];
            const recommendTimeVal = $recommendTime.innerHTML;
            const recommendTimeNVal = `24H Vol ${this.dataList[coin].vol}`;
            const recommendTypeVal = $recommendType.innerHTML;
            const recommendTypeNVal = this.dataList[coin].close ? this.dataList[coin].close.data : '';
            const percentageValue = $percentage.innerHTML;
            const percentageClass = $percentage.className;
            const percentageNValue = this.dataList[coin].rose ? this.dataList[coin].rose.data : '';
            const percentageNClass = `percentage ${this.dataList[coin].rose ? this.dataList[coin].rose.class : ''}`;

            if (recommendTimeVal !== recommendTimeNVal) {
              $recommendTime.innerHTML = recommendTimeNVal;
            }
            if (recommendTypeVal !== recommendTypeNVal) {
              $recommendType.innerHTML = recommendTypeNVal;
            }
            if (percentageValue !== percentageNValue) {
              $percentage.innerHTML = percentageNValue;
            }
            if (percentageClass !== percentageNClass) {
              $percentage.className = percentageNClass;
            }
          }
          if (!this.labelisShow) {
            this.labelShow(coinLabel, coin, len, index);
          }
        });
      });
      window.emitter.on('resize', () => {
        this.clientWidths = document.body.clientWidth;
      });
      this.bindEvent();
    }

    bindEvent(){
      this.$recommendContent.forEach((item) => {
        item.addEventListener('click', (e) => {
          const coin = item.dataset.coin;
          if (coin) {
            myStorage.set('sSymbolName', coin);
            myStorage.set('markTitle', coin.split('/')[1]);
          }
          location.href = '/trade';
        }, false);
      });

      this.$next.addEventListener('click', () => {
        let str = this.$recommendWrap.style.transform.match(/[(](.+)[)]/g)[0];
        str = str.replace('(', '');
        str = str.replace(')', '');
        const num = this.clientWidths / 2;
        const x = Math.abs(str.replace('px', '').split(',')[0]);
        let right = num + x;
        if (right > this.scrollMax - 30){
          right = this.scrollMax;
        }
        if (right === this.scrollMax){
          this.$next.style.display = 'none';
        }
        this.goPage(-right);
        this.$prev.style.display = 'block';
      }, false);

      this.$prev.addEventListener('click', () => {
        let str = this.$recommendWrap.style.transform.match(/[(](.+)[)]/g)[0];
        str = str.replace('(', '');
        str = str.replace(')', '');
        const num = this.clientWidths / 2;
        const x = Math.abs(str.replace('px', '').split(',')[0]);
        let left = num - x;
        if (left > -30){
          left = 0;
        }
        this.$next.style.display = 'block';
        if (left === 0){
          this.$prev.style.display = 'none';
        }
        this.goPage(left);
      }, false);
    }

    goPage (num) {
      this.$recommendWrap.style.transform = `translate3d(${num}px,0,0)`;
    };

    setData(coin) {
      this.myEcharts[coin].resize();
      this.myEcharts[coin].setOption({
        series: [
          {
            data: this.klineDataList[coin],
            type: 'line',
            lineStyle: {
              normal: {
                color: this.klineColor,
                width: this.lineWidth,
              },
            },
          },
        ],
      });
    }

    initEcharts(coin) {
      this.kLineIniting[coin] = true;
      let bg;
      bg = {
        normal: {
          color: new window.echarts.graphic.LinearGradient(
            0, 0, 0, 1,
            [
              {offset: 0, color: 'rgba(36,160,245,0.2)'},
              {offset: 1, color: 'rgba(36,160,245,0.05)'},
            ],
          ),
        },
      };
      // 基于准备好的dom，初始化echarts实例
      this.myEcharts[coin] = window.echarts.init(this.domTree[coin]['echart-box']);
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
                color: this.klineColor,
                width: 2,
              },
            },
            areaStyle: bg,
          },
        ],
      });
      this.klineTimer[coin] = setTimeout(() => {
        this.setData(coin);
      }, 0);
      this.kLineIniting[coin] = false;
      this.klinkInit[coin] = true;
      this.echartReady[coin] = true;
    }

    getCoinLabel(name, coinList = {}, coinTagLangs){
      if (coinList && coinList[name.toUpperCase()]) {
        const {coinTag = ''} = coinList[name.toUpperCase()];
        return coinTag ? coinTagLangs[coinTag] : '';
      }

      return '';
    }
    labelShow(coinLabel, coin, len, index) {
      if (coinLabel) {
        this.domTree[coin]['coin-text'].innerHTML = coinLabel;
        this.domTree[coin]['coin-label'].style.display = 'inline-block';
      }
      if (index === len - 1) {
        this.labelisShow = true;
      }
    };
  }

  window.RecommendExtend = RecommendExtend;
})();
