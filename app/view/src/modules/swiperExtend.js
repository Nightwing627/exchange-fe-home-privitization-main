(() => {
  class SwiperExtend {
    resetClass (inx){
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
        item.className = className;
      });
    }

    change(inx) {
      this.currentIndex = inx;
      this.$carouselItemsSapn.forEach((item) => {
        item.className = '';
      });
      this.$slideList.forEach((item) => {
        item.className = '';
      });
      this.$carouselItemsSapn[inx].className = 'active a-12-bg';
      this.resetClass(inx);
    }

    stop () {
      clearTimeout(this.timer);
      this.timer = null;
    }

    go () {
      clearTimeout(this.timer);
      this.timer = null;
      this.timer = setTimeout(() => {
        if(this.$slideList.length){
          this.currentIndex += 1;
          if (this.currentIndex > this.$slideList.length - 1) {
            this.currentIndex = 0;
          }
          this.change(this.currentIndex);
          this.go();
        }
      }, 4000);
    }

    init(){
      this.$swiper = document.querySelector('#swipers');
      this.$carouselWrap = this.$swiper.querySelector('.carousel-wrap');
      this.$slideUl = this.$swiper.querySelector('.slide-ul');
      this.$carouselItems = this.$swiper.querySelector('.carousel-items');
      this.lineWidth = 300;
      this.$slideListA = this.$slideUl.querySelectorAll('a');
      this.$slideList = this.$slideUl.querySelectorAll('li');
      this.$carouselItemsSapn = this.$carouselItems.querySelectorAll('span');
      this.currentIndex = 0;
      this.timer = null;
      const styleBox = this.$swiper.dataset;
      this.$swiper.style.height = styleBox.height;
      this.$swiper.style.width = styleBox.width;
      this.$swiper.classList.add(styleBox.bgcolor);
      this.$carouselWrap.style.height = styleBox.height;
      this.resetClass(this.currentIndex);
      this.$slideListA.forEach(( item ) => {
        item.style.backgroundImage = `url(${item.dataset.img})`;
      });
      this.$carouselItemsSapn.forEach((item, inx) => {
        let width = this.lineWidth / this.$slideList.length;
        item.style.width = width + 'px';
        if (!inx){
          item.className = 'active a-12-bg';
        }
      });
      this.bindEvent();
      this.go();
    }

    bindEvent() {
      this.$carouselItemsSapn.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const target = e.target;
          const inx = target.dataset.index;
          this.change(inx);
        }, false);
      });
      this.$slideList.forEach((item) => {
        item.addEventListener('mouseover', () => {
          this.stop();
        }, false);
      });
      this.$slideList.forEach((item) => {
        item.addEventListener('mouseout', () => {
          this.go();
        }, false);
      });
    }
  }

  window.SwiperExtend = SwiperExtend;
})();
