(() => {
  const { emitter } = window;
  class Tip {
    constructor() {
      this.createTip();
      this.createCss();
      emitter.on('tip', (opt) => {
        const type = opt.info || 'info';
        const { text } = opt;
        this.pushTip(type, text);
      });
      this.tip.addEventListener('transitionend', (e) => {
        const { target } = e;
        if (target.style.opacity === '0') {
          target.parentNode.removeChild(target);
        }
      }, false);
    }

    createTip() {
      const tip = document.createElement('section');
      tip.className = 'common-tip';
      this.tip = document.body.appendChild(tip);
    }

    pushTip(type, text) {
      const li = document.createElement('li');
      let color = '';
      let icon = '';
      switch (type) {
        case 'error':
          color = 'a-19-bd';
          icon = '#icon-c_5';
          break;
        case 'success':
          color = 'a-18-bd';
          icon = '#icon-c_4';
          break;
        case 'info':
          color = 'a-12-bd';
          icon = '#icon-c_3';
          break;
        case 'warning':
          color = 'a-20-bd';
          icon = '#icon-c_6';
          break;
        default:
          color = 'a-12-bd';
          icon = '#icon-c_3';
      }
      li.className = `common-tip-even a-4-bg b-1-cl ${color} tip-enter`;
      li.innerHTML = `<svg
            class='icon icon-16'
            aria-hidden='true'
          >
            <use xlink:href='${icon}'></use>
          </svg>
          <div class='text'>${text}</div>`;
      const tips = this.tip.appendChild(li);
      setTimeout(() => {
        tips.style.opacity = 1;
        tips.style.transform = 'translateX(0)';
      }, 100);
      setTimeout(() => {
        setTimeout(() => {
          tips.style.opacity = 0;
          tips.style.transform = 'translateX(30%)';
        }, 0);
      }, 3000);
    }

    createCss() {
      const css = '.enter-test{opacity:1;transform:translateX(0)}.tip-item-move{display:inline-block;margin-right:10px}.tip-enter-active,.tip-leave-active{transition:all .3s}.tip-enter,.tip-leave-to{opacity:0;transform:translateX(30%)}.common-tip{position:fixed;right:20px;top:83px;z-index:9999}.common-tip .info{border-left-width:3px;border-left-style:solid}.common-tip .common-tip-even{box-shadow:0 2px 10px rgba(0,0,0,0.15);width:280px;min-height:60px;margin-bottom:26px;border-left-width:3px;border-left-style:solid;box-sizing:border-box;transition:all .3s;padding:22px 25px 22px 52px;position:relative}.common-tip .common-tip-even .icon{position:absolute;width:16px;height:16px;top:25px;left:20px;border-radius:50%}.common-tip .common-tip-even .text{font-family:PingFangSC-Regular;font-size:14px;letter-spacing:0;text-align:left;line-height:22px}';
      const style = document.createElement('style');
      style.innerHTML = css;
      document.body.appendChild(style);
    }
  }
  window.BlockChainTip = new Tip();
})();
