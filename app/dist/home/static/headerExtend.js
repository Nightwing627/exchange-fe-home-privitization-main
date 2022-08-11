(() => {
  const {
    myStorage, setCookie, getScript,
  } = window.BlockChainUtils;
  const { location, fetchData, emitter } = window;
  class HeaderExtend {
    init() {
      this.$commonHeader = document.querySelector('#common-header');
      this.$headerCusNav = document.querySelector('#header-cus-nav');
      this.$headerNavEven = document.querySelector('#common-header-linkList');
      this.$commonHeaderOptionList = document.querySelector('.header-isLogin');
      // this.headerNavEvenList = Array.prototype.slice.call(this.$headerNavEven.querySelectorAll('.header-navEven'));
      this.$headerIsLoginNavEvenTitle = Array.prototype.slice.call(document.querySelectorAll('.header-isLogin-navEven-title'));
      this.$lanList = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.lang-list'));
      this.$loginBtn = this.$commonHeader.querySelector('.header-login-button');
      this.$registerBtn = this.$commonHeader.querySelector('.header-reg-button');
      this.headerNavEvenListIn = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.header-navEven-list'));
      this.$logOut = this.$commonHeader.querySelector('.logout');
      this.$colorList = Array.prototype.slice.call(document.querySelectorAll('#colorList li'));
      this.$appdownLoadCoin = this.$commonHeader.querySelector('.appdownLoad-coin');
      this.$colorSet = document.querySelector('#color-set');
      this.colorDialog = null;
      this.outFlag = true;
      this.getData();
      if (!window.BlockChainDialog && this.dialogPath) {
        getScript(`${window.staticDomain}/home/static/${this.dialogPath}`).then(() => {
          this.initColorDiaolog();
          this.bindEvent();
        });
      } else {
        this.initColorDiaolog();
        this.bindEvent();
      }
    }

    bindEvent() {
      if (this.$appdownLoadCoin) {
        this.$appdownLoadCoin.addEventListener('click', () => {
          window.location.href = '/appDownload';
        }, false);
      }
      if (this.headerNavEvenListIn.length) {
        this.headerNavEvenListIn.forEach((ul) => {
          Array.prototype.slice.call(ul.querySelectorAll('li')).forEach((li) => {
            li.addEventListener('mouseover', (e) => {
              const { target } = e;
              target.className = 'h-4-bg x-3-cl';
            }, false);
            li.addEventListener('mouseout', (e) => {
              const { target } = e;
              target.className = 'x-2-cl';
            }, false);
          });
        });
      }
      if (this.$colorSet) {
        this.$colorSet.addEventListener('click', () => {
          this.colorDialog.show();
        }, false);
      }

      Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.goMessage')).forEach((item) => {
        item.addEventListener('click', () => {
          location.href = '/mesage';
        }, false);
      });
      if (this.$logOut) {
        this.$logOut.addEventListener('click', () => {
          if (!this.outFlag) { return; }
          this.outFlag = false;
          fetchData({
            url: '/fe-ex-api/user/login_out',
          }).then((data) => {
            this.outFlag = true;
            if (data.code.toString() === '0') {
              emitter.emit('tip', { text: data.msg, type: 'success' });
              location.reload();
            } else {
              emitter.emit('tip', { text: data.msg, type: 'error' });
            }
          });
        }, false);
      }

      Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.goPersonal')).forEach((item) => {
        item.addEventListener('click', () => {
          location.href = '/personal/userManagement';
        }, false);
      });

      if (this.$loginBtn) {
        this.$loginBtn.addEventListener('click', () => {
          location.href = '/login';
        });
        this.$loginBtn.addEventListener('mouseover', () => {
          this.$loginBtn.className = 'common-button header-login-button common-button-text-kind u-11-cl u-12-bg';
        });
        this.$loginBtn.addEventListener('mouseout', () => {
          this.$loginBtn.className = 'common-button header-login-button common-button-text-kind u-11-cl';
        });
      }

      this.$registerBtn.addEventListener('click', () => {
        location.href = '/register';
      });

      this.$registerBtn.addEventListener('mouseover', () => {
        this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big u-8-cl u-8-bd';
      });
      this.$registerBtn.addEventListener('mouseout', () => {
        this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big u-11-cl u-8-bd ';
      });

      this.$lanList.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const { target } = e;

          if (target.tagName === 'LI') {
            target.className = 'h-4-bg x-3-cl';
          }
        });

        item.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'LI') {
            let lan = 'null';
            if (target.dataset && target.dataset.key) {
              [, lan] = target.dataset.key.split('/');
            }
            const newLan = window.location.href.match(/[a-z]+_[A-Z]+/)[0];
            if (lan === newLan) {
              target.className = 'h-4-bg x-3-cl';
            } else {
              target.className = '';
            }
          }
        });
        item.addEventListener('click', (e) => {
          const { target } = e;
          const data = target.dataset;
          if (target.tagName === 'LI') {
            if (data.link) {
              location.href = data.link;
            } else if (data.key) {
              location.href = data.key;
            }
          }
        });
      });
      this.$headerIsLoginNavEvenTitle.forEach((item) => {
        item.addEventListener('mouseover', (e) => {
          const { target } = e;
          if (target.tagName === 'DIV') {
            target.className = 'header-isLogin-navEven-title x-3-cl';
          }
        });
        item.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'DIV') {
            target.className = 'header-isLogin-navEven-title';
          }
        });
      });

      // this.$headerNavEven.addEventListener('click', (e) => {
      //   const { target } = e;
      //   const data = target.dataset;
      //   const { link } = data;
      //   const tar = data.target;
      //   const { trades } = data;
      //   const { id } = data;
      //   if (trades) {
      //     if (id === 'exTrade' && this.etfOpen) {
      //       myStorage.set('markTitle', '');
      //       myStorage.set('sSymbolName', '');
      //     }
      //   }
      //   if (!target.children.length || window.ispc === 'false') {
      //     if (tar === 'black') {
      //       window.open(link);
      //     } else {
      //       window.location.href = link;
      //     }
      //   }
      // }, false);

      // this.$headerNavEven.addEventListener('mouseout', () => {
      //   this.headerNavEvenList.forEach((item) => {
      //     // eslint-disable-next-line no-param-reassign
      //     item.className = 'header-navEven';
      //   });
      // }, false);
      // this.$headerNavEven.addEventListener('mouseover', (e) => {
      //   const { target } = e;
      //   this.headerNavEvenList.forEach((item) => {
      //     // eslint-disable-next-line no-param-reassign
      //     item.className = 'header-navEven';
      //   });
      //   if (target.className === 'header-navEven') {
      //     target.className = 'header-navEven x-3-cl';
      //   }
      // }, false);

      if (this.$headerCusNav) {
        this.$headerCusNav.addEventListener('mouseover', (e) => {
          const { target } = e;
          if (target.tagName === 'A') {
            target.className = 'h-4-bg x-3-cl';
          }
        }, false);
        this.$headerCusNav.addEventListener('mouseout', (e) => {
          const { target } = e;
          if (target.tagName === 'A') {
            target.className = 'x-2-cl g-3-cl-h';
          }
        }, false);
      }
    }

    login() {
      fetchData({
        method: 'post',
        url: '/fe-ex-api/common/user_info',
      }).catch(() => {
      })
        .then((data) => {
          if (data) {
            if (!Number(data.code)) {
              window.isLogin = true;
              const $loginSet = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.login-set'));
              const $footerBox = document.querySelector('#footer-box');
              const $logOut = $footerBox.querySelector('.logout');
              $loginSet.forEach((target) => {
                // eslint-disable-next-line no-param-reassign
                target.style.display = 'flex';
              });
              $logOut.style.display = 'block';
              const $unloginSet = Array.prototype.slice.call(this.$commonHeader.querySelectorAll('.unlogin-set'));
              $unloginSet.forEach((target) => {
                // eslint-disable-next-line no-param-reassign
                target.style.display = 'none';
              });
              if (this.$commonHeader.querySelector('.userText')) {
                this.$commonHeader.querySelector('.userText').innerHTML = data.data.userAccount;
              }
              if (this.$commonHeader.querySelector('.userStatus')) {
                this.$commonHeader.querySelector('.userStatus').innerHTML = `${this.locale.userStatus}: ${this.userState[Number(data.data.accountStatus)]}`;
              }
            }
            window.emitter.emit('login');
          }
        });
    }

    getMessage() {
      fetchData({
        url: '/fe-ex-api/message/v4/get_no_read_message_count',
        method: 'post',
        // eslint-disable-next-line no-unused-vars
      }).catch((error) => {
      })
        .then((data) => {
          if (data && !Number(data.code)) {
            if (data.data.noReadMsgCount) {
              const $headerUserMessage = this.$commonHeader.querySelector('.header-user-message');
              this.$commonHeader.querySelector('#messageMore').style.display = 'block';
              $headerUserMessage.classList.add('message-list');
              const { userMessageList } = data.data;
              let html = '';
              userMessageList.forEach((item) => {
                html += `<li class="x-2-cl mesageNav">
                                    ${item.messageContent}
                                </li>`;
              });
              $headerUserMessage.querySelector('.header-user-text').innerHTML = html;
            }
          }
        });
    }

    getData() {
      this.login();
      this.getMessage();
    }

    initColorDiaolog() {
      this.$colorList.forEach((item) => {
        if (item.dataset.checked) {
          item.classList.add('checked');
        }
      });
      this.colorDialog = new window.BlockChainDialog({
        locale: this.locale,
        content: `<div class="setBox">
                            <div class="setColor clearfix">
                                <div class="setColor-key x-2-cl">${this.locale.color}</div>
                                <ul class="setColor-value colorList">
                                   ${document.querySelector('#colorList').innerHTML}
                                </ul>
                            </div>
                        </div>`,
        confirm() {
          const $checked = this.dialog.querySelector('.checked');
          setCookie('cusSkin', $checked.dataset.id);
          window.location.reload();
        },
      });

      const $DialogColorList = Array.prototype.slice.call(this.colorDialog.dialog.querySelectorAll('.colorList li'));
      $DialogColorList.forEach((item) => {
        item.addEventListener('click', () => {
          if (!item.classList.contains('checked')) {
            $DialogColorList.forEach((el) => {
              el.classList.remove('checked');
            });
            item.classList.add('checked');
          }
        });
      });
    }
  }

  window.HeaderExtend = HeaderExtend;
})();
