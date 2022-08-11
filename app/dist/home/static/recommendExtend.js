(() => {
  const { getScript, myStorage, colorMap } = window.BlockChainUtils;
  class RecommendExtend {
    init() {
      this.$recommendWrap = this.$recommend.querySelector('.recommend-wrap');
      this.$recommendContent = Array.prototype.slice.call(this.$recommend.querySelectorAll('.recommend-content'));
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
      this.classMap = {};
      this.timer = null;
      this.scrollRG = 0;
      this.clientWidths = document.body.offsetWidth;
      let width = this.liItemWidth * this.$recommendContent.length;
      // eslint-disable-next-line no-mixed-operators
      this.itemWidth = this.len / 2 * this.liItemWidth - 20;
      if (this.$recommend.querySelector('.cloned')) {
        this.$recommendContent = Array.prototype.slice.call(this.$recommend.querySelectorAll('.recommend-content'));
        width = this.liItemWidth * this.$recommendContent.length;
        this.addKeyFrames(width / 2);
        this.$recommendWrap.classList.add('play');
        // this.autoScroll();
        this.isScroll = true;
      }

      if (this.setWarpWdith) {
        this.$recommendWrap.style.width = `${width}px`;
      }
      this.$prev = this.$recommend.querySelector('.prev');
      this.$next = this.$recommend.querySelector('.next');
      this.clientWidths = document.body.offsetWidth;
      this.scrollMax = this.len * this.liItemWidth - this.clientWidths;
      this.itemWidth = this.len * this.liItemWidth - 20;
      /*      if (this.isScroll){
        this.itemWidth = this.len / 2 * 300 - 20;
      } */
      this.$recommendWrap.style.display = 'block';
      this.$recommendContent.forEach((item) => {
        const { coin } = item.dataset;
        if (coin) {
          if (!this.domTree[coin]) {
            this.domTree[coin] = {};
            this.classMap[coin] = '';
          }
          this.domTree[coin].percentage = item.querySelector('.percentage');
          this.domTree[coin].recommendPrice = item.querySelector('.recommendPrice');
          this.domTree[coin].recommendTime = item.querySelector('.recommendTime');
          this.domTree[coin]['coin-text'] = item.querySelector('.coin-text');
          this.domTree[coin]['coin-label'] = item.querySelector('.coin-label');
          this.domTree[coin]['echart-box'] = item.querySelector('.echart-box');
          if (this.domTree[coin].percentage) {
            this.classMap[coin] = this.domTree[coin].percentage.className;
          }
        }
      });
      if (this.$recommendWrap && this.$recommendWrap.dataset.style) {
        const dataStyle = JSON.parse(this.$recommendWrap.dataset.style);
        Object.keys(dataStyle).forEach((item) => {
          this.$recommendWrap.style[item] = dataStyle[item];
        });
      }
      if (this.itemWidth > this.clientWidths && !this.isScroll) {
        if (this.$next) {
          this.$next.style.display = 'block';
        }
      }
      if (!window.echarts) {
        getScript(`${this.echartsPath}`).then(() => {
          if (!Object.keys(this.myEcharts).length) {
            const keys = Object.keys(this.klineDataList);
            if (keys.length) {
              this.$recommendContent.forEach((target) => {
                const { coin } = target.dataset;
                console.log('target.dataset', target.dataset);
                const coinC = coin.replace('-c', '');
                if (!this.klineTimer[coinC]) {
                  this.klineTimer[coinC] = null;
                }
                this.klineTimer[coinC] = setTimeout(() => {
                  this.initEcharts(coinC);
                }, 0);
              });
            }
          }
        });
      }

      window.emitter.on('RECOMMEEND_KLINE_DATA', (data) => {
        this.resloveKline(data);
      });
      window.emitter.on('RECOMMEEND_DATA', (data) => {
        this.resloveRecommendData(data);
      });
      window.emitter.on('resize', () => {
        this.clientWidths = document.body.offsetWidth;
      });

      this.bindEvent();
    }

    resloveKline(data) {
      if (JSON.stringify(data) === JSON.stringify(this.klineDataList)) {
        return;
      }
      this.klineDataList = JSON.parse(JSON.stringify(data));
      console.log('klineDataList', this.klineDataList);
      // eslint-disable-next-line no-param-reassign
      data = null;
      this.$recommendContent.forEach((target) => {
        const { coin } = target.dataset;
        if (!this.klineTimer[coin]) {
          this.klineTimer[coin] = null;
        }
        if (this.echartReady[coin]) {
          this.klineTimer[coin] = setTimeout(() => {
            this.setData(coin);
          }, 0);
        } else if (window.echarts && !this.klinkInit[coin] && !this.kLineIniting[coin]) {
          this.klineTimer[coin] = setTimeout(() => {
            this.initEcharts(coin);
          }, 0);
        }
      });
    }

    resloveRecommendData(data) {
      console.log('resloveRecommendData', data);
      const { recommendDataList, coinList, coinTagLangs } = data;
      const keys = Object.keys(recommendDataList);
      keys.forEach((item) => {
        const coinLabel = (recommendDataList[item] && recommendDataList[item].symbol)
          ? this.getCoinLabel(recommendDataList[item].symbol.symbol, coinList, coinTagLangs)
          : '';
        recommendDataList[item].coinLabel = coinLabel;
      });
      this.dataList = recommendDataList;
      this.$recommendContent.forEach((item, index) => {
        const { coin } = item.dataset;
        const coinC = coin.replace('-c', '');
        const { coinLabel } = this.dataList[coinC];
        const len = this.$recommendContent.length;
        let recommendTimeVal = '';
        if (this.dataList[coinC]) {
          const $percentage = this.domTree[coin].percentage;
          const $recommendType = this.domTree[coin].recommendPrice;
          const $recommendTime = this.domTree[coin].recommendTime;
          if ($recommendTime) {
            recommendTimeVal = $recommendTime.innerHTML;
          }
          const recommendTimeNVal = `24H Vol <span>${this.dataList[coinC].vol ? this.dataList[coinC].vol : ''}</span>`;
          const recommendTypeVal = $recommendType.innerHTML;
          const recommendTypeNVal = this.dataList[coinC].close ? this.dataList[coinC].close.data : '';
          const percentageValue = $percentage.innerHTML;
          const percentageClass = $percentage.className;
          const percentageNValue = this.dataList[coinC].rose ? this.dataList[coinC].rose.data : '';
          const percentageNClass = `${this.classMap[coin]} ${this.dataList[coinC].rose ? this.dataList[coinC].rose.class : ''}`;

          if (recommendTimeVal && recommendTimeVal !== recommendTimeNVal) {
            $recommendTime.innerHTML = recommendTimeNVal;
          }
          if (recommendTypeVal !== recommendTypeNVal) {
            $recommendType.innerHTML = recommendTypeNVal;
          }
          if (percentageValue !== percentageNValue) {
            $percentage.innerHTML = percentageNValue;
          }
          if (percentageClass !== percentageNClass) {
            $percentage.className = `${percentageNClass} rose`;
          }
        }
        if (!this.labelisShow) {
          this.labelShow(coinLabel, coin, len, index);
        }
      });
    }

    addKeyFrames(y) {
      const style = document.createElement('style');
      style.type = 'text/css';
      const keyFrames = `
    @-webkit-keyframes rowup {
        0% {
            -webkit-transform: translate3d(-620px, 0, 0);
            transform: translate3d(-620px, 0, 0);
        }
        100% {
            -webkit-transform: translate3d(-${y}px, 0, 0);
            transform: translate3d(-${y}px, 0, 0);
        }
    }
    @keyframes rowup {
        0% {
            -webkit-transform: translate3d(-620px, 0, 0);\
            transform: translate3d(-620px, 0, 0);\
        }
        100% {
            -webkit-transform: translate3d(-${y}px, 0, 0);\
            transform: translate3d(-${y}px, 0, 0);\
        }
    }`;
      style.innerHTML = keyFrames;
      document.getElementsByTagName('head')[0].appendChild(style);
    }

    /*    autoScroll(){
      clearTimeout(this.timer);
      const sum = this.len / 2 * this.liItemWidth - this.clientWidths;
      this.scrollRG += 1;
      if (this.scrollRG > sum) {
        // this.scrollRG = sum % this.liItemWidth
        this.scrollRG = this.len * this.liItemWidth - this.clientWidths;
      }
      this.$recommendWrap.style.marginLeft = `-${this.scrollRG}px`;
      this.timer = setTimeout(this.autoScroll.bind(this), 50);
    } */

    bindEvent() {
      if (this.isScroll) {
        this.$recommendWrap.addEventListener('mouseenter', () => {
          this.$recommendWrap.classList.add('pause');
        });
        this.$recommendWrap.addEventListener('mouseleave', () => {
          this.$recommendWrap.classList.remove('pause');
        });
      }
      this.$recommendContent.forEach((item) => {
        item.addEventListener('click', () => {
          const { coin } = item.dataset;
          if (coin) {
            myStorage.set('sSymbolName', coin);
            myStorage.set('markTitle', coin.split('/')[1]);
          }
          window.location.href = `/trade/${coin.replace('/', '_')}`;
        }, false);
      });
      if (this.$next) {
        this.$next.addEventListener('click', () => {
          let str = this.$recommendWrap.style.transform.match(/[(](.+)[)]/g)[0];
          str = str.replace('(', '');
          str = str.replace(')', '');
          const num = this.clientWidths / 2;
          const x = Math.abs(str.replace('px', '').split(',')[0]);
          let right = num + x;
          if (right > this.scrollMax - 30) {
            right = this.scrollMax;
          }
          if (right === this.scrollMax) {
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
          if (left > -30) {
            left = 0;
          }
          this.$next.style.display = 'block';
          if (left === 0) {
            this.$prev.style.display = 'none';
          }
          this.goPage(left);
        }, false);
      }
    }

    goPage(num) {
      this.$recommendWrap.style.transform = `translate3d(${num}px,0,0)`;
    }

    setData(coin) {
      const coinC = coin.replace('-c', '');
      let color = this.klineColor;
      if (this.roseConfig) {
        if (this.dataList[coinC]) {
          if (this.dataList[coinC].rose) {
            if (this.dataList[coinC].rose.class) {
              color = colorMap[this.dataList[coinC].rose.class];
            }
          }
        }
      }
      if (this.cusKlineColor) {
        color = this.cusKlineColor;
      }
      if (this.cusTomKline) {
        this.cusTomKline(color, coinC);
      }
      let { lineWidth } = this;
      if (this.cusLineWidth) {
        lineWidth = this.cusLineWidth;
      }
      let data = null;
      if (this.klineDataList[coinC]) {
        data = JSON.parse(JSON.stringify(this.klineDataList[coinC]));
      }
      // let data = JSON.parse(JSON.stringify(this.klineDataList[coinC]));
      this.myEcharts[coin].resize();
      this.myEcharts[coin].setOption({
        series: [
          {
            data,
            type: 'line',
            lineStyle: {
              normal: {
                color,
                width: lineWidth,
              },
            },
          },
        ],
      });
      data = null;
    }

    initEcharts(coin) {
      if (this.ish5) return;
      const coinC = coin.replace('-c', '');
      let color = this.klineColor;
      if (this.dataList[coinC]) {
        if (this.dataList[coinC].rose) {
          if (this.dataList[coinC].rose.class) {
            color = colorMap[this.dataList[coinC].rose.class];
          }
        }
      }

      if (this.cusKlineColor) {
        color = this.cusKlineColor;
      }
      if (this.cusTomKline) {
        this.cusTomKline(color, coin);
      }
      this.kLineIniting[coin] = true;
      let bg = null;
      if (this.haveBg) {
        bg = {
          normal: {
            color: new window.echarts.graphic.LinearGradient(
              0, 0, 0, 1,
              [
                { offset: 0, color: 'rgba(36,160,245,0.2)' },
                { offset: 1, color: 'rgba(36,160,245,0.05)' },
              ],
            ),
          },
        };
      }
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
                color,
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

    getCoinLabel(name, coinList = {}, coinTagLangs) {
      if (coinList && coinList[name.toUpperCase()]) {
        const { coinTag = '' } = coinList[name.toUpperCase()];
        return coinTag ? coinTagLangs[coinTag] : '';
      }

      return '';
    }

    labelShow(coinLabel, coin, len, index) {
      if (this.domTree[coin]['coin-text']) {
        if (coinLabel) {
          this.domTree[coin]['coin-text'].innerHTML = coinLabel;
          this.domTree[coin]['coin-label'].style.display = 'inline-block';
        }
        if (index === len - 1) {
          this.labelisShow = true;
        }
      }
    }
  }

  window.RecommendExtend = RecommendExtend;
})();
