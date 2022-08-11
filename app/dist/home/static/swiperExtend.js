(() => {
  class SwiperExtend {
    resetClass(inx) {
      this.$slideList.forEach((item) => {
        const index = Number(item.dataset.index);
        let className = '';
        if (index === inx) {
          className = 'show';
        }
        if (index > inx) {
          className = 'left';
        }
        if (index < inx) {
          className = 'right';
        }
        // eslint-disable-next-line no-param-reassign
        item.className = className;
      });
    }

    change(inx) {
      let cl = 'active a-12-bg ';
      if (this.activeClass) {
        cl += this.activeClass;
      }
      this.currentIndex = inx;
      this.$carouselItemsSapn.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.className = '';
      });
      this.$slideList.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.className = '';
      });
      this.$carouselItemsSapn[inx].className = cl;
      this.resetClass(inx);
    }

    stop() {
      clearTimeout(this.timer);
      this.timer = null;
    }

    go() {
      clearTimeout(this.timer);
      this.timer = null;
      this.timer = setTimeout(() => {
        if (this.$slideList.length) {
          this.currentIndex += 1;
          if (this.currentIndex > this.$slideList.length - 1) {
            this.currentIndex = 0;
          }
          this.change(this.currentIndex);
          this.go();
        }
      }, 4000);
    }

    init() {
      this.$swiper = document.querySelector('#swipers');
      this.$carouselWrap = this.$swiper.querySelector('.carousel-wrap');
      this.$slideUl = this.$swiper.querySelector('.slide-ul');
      this.$carouselItems = this.$swiper.querySelector('.carousel-items');
      this.lineWidth = 300;
      this.$slideListA = Array.prototype.slice.call(this.$slideUl.querySelectorAll('a'));
      this.$slideList = Array.prototype.slice.call(this.$slideUl.querySelectorAll('li'));
      if (this.$carouselItems) {
        this.$carouselItemsSapn = Array.prototype.slice.call(this.$carouselItems.querySelectorAll('span'));
      }
      this.currentIndex = 0;
      this.timer = null;
      const styleBox = this.$swiper.dataset;
      this.$swiper.style.height = styleBox.height;
      this.$swiper.style.width = styleBox.width;
      this.$swiper.classList.add(styleBox.bgcolor);
      this.$carouselWrap.style.height = styleBox.height;
      this.resetClass(this.currentIndex);
      this.$slideListA.forEach((item) => {
        // eslint-disable-next-line no-param-reassign
        item.style.backgroundImage = `url(${item.dataset.img})`;
      });
      let cl = 'active a-12-bg ';
      if (this.activeClass) {
        cl += this.activeClass;
      }
      if (this.$carouselItemsSapn) {
        this.$carouselItemsSapn.forEach((item, inx) => {
          const width = this.lineWidth / this.$slideList.length;
          // eslint-disable-next-line no-param-reassign
          item.style.width = `${width}px`;
          if (!inx) {
            // eslint-disable-next-line no-param-reassign
            item.className = cl;
          }
        });
      }
      this.renderBanner();
      this.bindEvent();
      if (this.$carouselItemsSapn) {
        this.go();
      }
    }

    renderBanner() {
      this.$slideListA.forEach((target) => {
        const { img } = target.dataset;
        // eslint-disable-next-line no-param-reassign
        target.style.backgroundImg = `url(${img})`;
      });
    }

    bindEvent() {
      if (this.$carouselItemsSapn) {
        this.$carouselItemsSapn.forEach((item) => {
          item.addEventListener('mouseover', (e) => {
            const { target } = e;
            const inx = target.dataset.index;
            this.change(Number(inx));
          }, false);
        });
      }
      this.$slideList.forEach((item) => {
        item.addEventListener('mouseover', () => {
          this.stop();
        }, false);
      });
      this.$slideList.forEach((item) => {
        item.addEventListener('mouseout', () => {
          if (this.$carouselItemsSapn) {
            this.go();
          }
        }, false);
      });
    }
  }

  window.SwiperExtend = SwiperExtend;
})();
