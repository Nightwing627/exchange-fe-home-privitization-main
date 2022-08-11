(() => {
  class InternationSwiperExtend {
    init() {
      this.pageWidth = this.getPageWidth();
      this.renderBanner();
      if (this.imgPages) {
        this.renderNav();
      }
    }

    getPageWidth() {
      return Math.floor((this.pageTime / this.swiperTime) * 40);
    }

    bindNavEvent() {
      this.navList.forEach((target, index) => {
        target.addEventListener('click', () => {
          this.page = index;
          this.changeImg();
          this.navList.forEach((item) => {
            // eslint-disable-next-line no-param-reassign
            item.classList.remove('active');
          });
          // eslint-disable-next-line no-param-reassign
          target.classList.add('active');
        }, false);
      });
    }

    renderNav() {
      let html = '';
      const len = this.imgBox.length;
      for (let i = 0; i < len; i += 1) {
        let active = '';
        if (!i) {
          active = 'active';
        }
        html += `<li class="${active}">
                                <span class="pageBg"></span>
                                <span class="pageBar" style="width: ${this.pageWidth}px">
                                </span>
                            </li>`;
      }
      this.imgPages.innerHTML = html;
      this.navList = Array.prototype.slice.call(this.imgPages.querySelectorAll('li'));
      this.bindNavEvent();
      this.autoRun();
    }

    changeImg() {
      this.imgBox.forEach((target) => {
        // eslint-disable-next-line no-param-reassign
        target.style.display = 'none';
      });
      this.imgBox[this.page].style.display = 'block';
      this.pageTime = 0;
    }

    renderBanner() {
      this.imgList.forEach((target) => {
        if (this.imgPages) {
          target.addEventListener('mouseover', () => {
            clearTimeout(this.timer);
          }, false);
          target.addEventListener('mouseout', () => {
            this.autoRun();
          }, false);
        }
      });
    }

    autoRun() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const target = this.navList[this.page].querySelector('.pageBar');
        target.style.width = `${Math.floor((this.pageTime / this.swiperTime) * 40)}px`;
        this.pageTime += 100;
        if (this.pageTime > this.swiperTime) {
          target.style.width = `${0}px`;
          this.pageTime = 0;
          this.page += 1;
          if (this.page >= this.imgBox.length) {
            this.page = 0;
          }
          this.navList[this.page].click();
        }
        this.autoRun();
      }, 100);
    }
  }
  window.InternationSwiperExtend = InternationSwiperExtend;
})();
