(() => {
  const { fetchData } = window;
  const { getCookie, setCookie } = window.BlockChainUtils;

  class HomeDialog {
    constructor() {
      this.dialogType = 'text'; // 弹窗类型 text / img
      this.showFlag = false; // 展示变量
      this.titleText = ''; // 富文本类 -- 提示文案
      this.oneText = ''; // 富文本类 -- 第一个按钮的文案
      this.oneLink = ''; // 富文本类 -- 第一个按钮的跳转链接
      this.twoText = ''; // 富文本类 -- 第二个按钮的文案
      this.twoLink = ''; // 富文本类 -- 第二个按钮的跳转链接
      this.htmlText = ''; // 富文本框内容
      this.haveTwo = false; // 富文本类 -- 是否有第二个按钮
      this.haveOption = false; // 富文本类 -- 是否有下面option区域
      this.imgUrl = ''; // 图片类 -- 图片地址
      this.imgLink = ''; // 图片类 -- 图片跳转链接
      this.nowId = '';
      this.init();
    }

    init() {
      fetchData({
        url: '/fe-ex-api/homepage_Elastic_Layer',
        method: 'post',
        params: {
          terminalType: '0',
        },
      }).then((data) => {
        if (!Number(data.code) && data.data) {
          const {
            activityTitle,
            startTime,
            endTime,
            displayType,
            picturePath,
            pictureUrl,
            imageText,
            buttonWritingOne,
            buttonWritingTwo,
            buttonUrlOne,
            buttonUrlTwo,
            id,
            mtime,
            isLogin,
          } = data.data;
          this.dialogType = displayType.toString() === '0' ? 'img' : 'text'; // 类型
          this.titleText = activityTitle; // 标题
          if (this.dialogType === 'img') {
            // 图片地址
            if (picturePath && picturePath.length) {
              this.imgUrl = picturePath;
            }
            // 图片跳转地址
            if (pictureUrl && pictureUrl.length) {
              this.imgLink = pictureUrl;
            }
          } else {
            // 富文本内容
            if (imageText && imageText.length) {
              this.htmlText = imageText;
            }
            // 按钮1文案
            if (buttonWritingOne && buttonWritingOne.length) {
              this.oneText = buttonWritingOne;
              this.haveOption = true;
            }
            // 按钮1跳转地址
            if (buttonUrlOne && buttonUrlOne.length) {
              this.oneLink = buttonUrlOne;
            }
            // 按钮2文案
            if (buttonWritingTwo && buttonWritingTwo.length) {
              this.twoText = buttonWritingTwo;
              this.haveTwo = true;
              this.haveOption = true;
            }
            // 按钮2跳转地址
            if (buttonUrlTwo && buttonUrlTwo.length) {
              this.twoLink = buttonUrlTwo;
            }
          }
          //   const { isLogin } = this.$store.state.baseData;
          let flag = false;
          this.nowId = `${id}-${mtime}`;
          const cookieArr = getCookie('homeAlertArr')
            ? JSON.parse(getCookie('homeAlertArr')) : [];
          let cookieFlag = false;
          if (cookieArr.indexOf(this.nowId) === -1) {
            cookieFlag = true;
          }
          if (window.isLogin && isLogin) {
            flag = true;
          }
          if (!Number(isLogin)) {
            flag = true;
          }
          const time = new Date().getTime();
          if (time > startTime && time < endTime && flag && cookieFlag) {
            this.showFlag = true;
          }
          if (this.showFlag) {
            this.createDialog();
            this.createStyle();
            this.createEvent();
          }
        }
      });
    }

    setCookieArr() {
      const cookieArr = getCookie('homeAlertArr')
        ? JSON.parse(getCookie('homeAlertArr')) : [];
      cookieArr.push(this.nowId);
      setCookie('homeAlertArr', JSON.stringify(cookieArr));
    }

    createEvent() {
      if (this.dialogImg) {
        this.dialogImg.addEventListener('click', () => {
          if (this.imgLink) {
            window.location.href = this.imgLink;
          } else {
            this.closeDialog();
            this.setCookieArr();
          }
        }, false);
      }
      if (this.dialogClose) {
        this.dialogClose.addEventListener('click', () => {
          this.closeDialog();
          this.setCookieArr();
        }, false);
      }
      if (this.oneBtn) {
        this.oneBtn.addEventListener('click', () => {
          if (this.oneLink) {
            window.location.href = this.oneLink;
          } else {
            this.closeDialog();
            this.setCookieArr();
          }
        }, false);
      }
      if (this.towBtn) {
        this.towBtn.addEventListener('click', () => {
          if (this.twoLink) {
            window.location.href = this.twoLink;
          } else {
            this.closeDialog();
            this.setCookieArr();
          }
        }, false);
      }
    }

    closeDialog() {
      this.homeDialog.style.display = 'none';
    }

    createDialog() {
      this.homeDialog = document.createElement('section');
      this.homeDialog.className = 'common-homeDialog';
      let containerHtml = '';
      if (this.dialogType === 'text') {
        containerHtml = ` <div>
                        <div class="dialog-frame-head a-4-bg">
                          <span class="dialog-frame-head-text b-1-cl">${this.titleText}</span>
                          <span class="dialog-frame-head-close">
                          <section class="common-iconButton">
                           <div class="iconButton-icon">
                             <svg aria-hidden="true" class="icon icon-16">
                             <use xlink:href="#icon-c_7"></use>
                             </svg>
                           </div>
                           <div class="iconButton-bg"></div>
                          </section>
                          </span>
                        </div>
                        <div class="dialog-frame-body">
                          <section>${this.htmlText}</section>
                        </div>
                        <div class="dialog-frame-bottom a-4-bg" v-if="haveOption">
                          <div
                            class="dialog-frame-options"
                            :class="!haveTwo ? 'dialog-frame-options-oneBtn' : ''"
                          >
                           <button class="common-button closeBtnClass common-button-text u-8-cl towBtn"
                           style="height: 40px; padding-left: 31px; padding-right: 31px; margin-top: 0px;"
                           ><div class="common-button-slot">${this.twoText}</div>
                            <div class='solidBc bghover u-9-bg'></div>
                            <div class='solidBc bgactive u-10-bg'></div>
                           </button>
                          <button class="common-button common-button-solid u-8-bg u-16-cl oneBtn"
                           style="height: 40px; padding-left: 31px; padding-right: 31px; margin-top: 0px;"
                           ><div class="common-button-slot">${this.oneText}</div>
                           <div class='solidBc bghover u-14-bg'></div>
                            <div class='solidBc bgactive u-15-bg'></div>
                           </button>
                          </div>
                        </div>
                      </div>`;
      } else {
        containerHtml = ` <div class="dialog-imgBox">
                        <span class="dialog-imgBox-close">
                            <section class="common-iconButton">
                           <div class="iconButton-icon">
                             <svg aria-hidden="true" class="icon icon-16">
                             <use xlink:href="#icon-c_7"></use>
                             </svg>
                           </div>
                           <div class="iconButton-bg"></div>
                          </section>
                        </span>
                        <img style="width: 100%; display: block" src="${this.imgUrl}" alt class="diaolog-img"/>
                      </div>`;
      }
      const html = `<div class="dialog-markAll u-7-bg"></div>
                      <div class="dialog-frame a-5-bg">
                        ${containerHtml}
                    </div>`;
      this.homeDialog.innerHTML = html;
      document.body.appendChild(this.homeDialog);
      this.dialogImg = this.homeDialog.querySelector('.diaolog-img');
      this.dialogClose = this.homeDialog.querySelector('.common-iconButton');
      this.oneBtn = this.homeDialog.querySelector('.oneBtn');
      this.towBtn = this.homeDialog.querySelector('.towBtn');
    }

    createStyle() {
      const css = `.drop-enter-active {
                  animation: drop-in 0.3s;
                }
                .drop-leave-active {
                  animation: drop-in 0.3s reverse;
                }
                .common-homeDialog .btnClass {
                  margin-right: 10px;
                }
                .common-homeDialog .dialog-imgBox {
                  min-height: 200px;
                  max-height: 600px;
                  overflow-y: scroll;
                  position: relative;
                  border-radius: 4px;
                }
                .common-homeDialog .dialog-imgBox-close {
                  right: 20px;
                  cursor: pointer;
                  font-size: 20px;
                  top: 12px;
                  position: absolute;
                }
                .common-homeDialog .dialog-markAll {
                  position: fixed;
                  width: 100%;
                  height: 100%;
                  z-index: 999;
                  top: 0;
                  left: 0;
                }
                .common-homeDialog .dialog-frame {
                  transform: 0.3s transition;
                  position: fixed;
                  z-index: 1000;
                  left: 50%;
                  top: 50%;
                  transform: translate3d(-50%, -50%, 0);
                  width: 800px;
                  border-radius: 2px;
                }
                .common-homeDialog .dialog-frame-head {
                  box-sizing: border-box;
                  height: 60px;
                  width: 100%;
                  padding: 0 30px;
                  line-height: 60px;
                }
                .common-homeDialog .dialog-frame-head-text {
                  font-size: 16px;
                }
                .common-homeDialog .dialog-frame-head-close {
                  float: right;
                  cursor: pointer;
                  font-size: 20px;
                  margin-top: 12px;
                }
                .common-homeDialog .dialog-frame-body {
                  width: 740px;
                  min-height: 200px;
                  max-height: 440px;
                  overflow-y: scroll;
                  margin-left: 30px;
                  box-sizing: border-box;
                  padding: 30px 0;
                }
                .common-homeDialog .closeBtnClass {
                  font-size: 14px;
                  margin-right: 10px;
                }
                .common-homeDialog .dialog-frame-bottom {
                  height: 100px;
                  position: relative;
                }
                .common-homeDialog .dialog-frame-bottom .dialog-frame-options {
                  position: absolute;
                  right: 30px;
                  top: 30px;
                }
                .common-homeDialog .dialog-frame-bottom .dialog-frame-options-oneBtn {
                  right: 50%;
                  transform: translateX(50%);
                }
                @-moz-keyframes drop-in {
                  0% {
                    top: 35%;
                    opacity: 0.7;
                  }
                  100% {
                /* margin-top: 10px; */
                    opacity: 1;
                  }
                }
                @-webkit-keyframes drop-in {
                  0% {
                    top: 35%;
                    opacity: 0.7;
                  }
                  100% {
                /* margin-top: 10px; */
                    opacity: 1;
                  }
                }
                @-o-keyframes drop-in {
                  0% {
                    top: 35%;
                    opacity: 0.7;
                  }
                  100% {
                /* margin-top: 10px; */
                    opacity: 1;
                  }
                }
                @keyframes drop-in {
                  0% {
                    top: 35%;
                    opacity: 0.7;
                  }
                  100% {
                /* margin-top: 10px; */
                    opacity: 1;
                  }
                }
                `;
      const style = document.createElement('style');
      style.innerHTML = css;
      document.querySelector('head').appendChild(style);
    }
  }

  window.HomeDialog = HomeDialog;
})();
