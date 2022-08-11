(() => {
  const { myStorage, getCookie, formatTime, setCookie, getScript } = window.BlockChainUtils;
  class HeaderExtend {
    init() {
      this.$commonHeader = document.querySelector('#common-header');
      this.$headerCusNav = document.querySelector('#header-cus-nav');
      this.$headerNavEven = document.querySelector('#common-header-linkList');
      this.headerNavEvenList = this.$headerNavEven.querySelectorAll('.header-navEven');
      this.$lanList = this.$commonHeader.querySelectorAll('.lang-list');
      this.$loginBtn = this.$commonHeader.querySelector('.header-login-button');
      this.$registerBtn = this.$commonHeader.querySelector('.header-reg-button');
      this.$colorList = document.querySelectorAll('#colorList li');
      this.$colorSet = document.querySelector('#color-set');
      this.colorDialog = null;
      this.getData();
      if (!window.BlockChainDialog && this.dialogPath) {
        getScript(`/home/static/${this.dialogPath}`).then(() => {
          this.initColorDiaolog();
          this.bindEvent();
        });
      } else {
        this.initColorDiaolog();
        this.bindEvent();
      }
    }

    bindEvent() {
      if (this.$colorSet) {
        this.$colorSet.addEventListener('click', () => {
          this.colorDialog.show();
        }, false);
      }

      this.$commonHeader.querySelectorAll('.goMessage').forEach(item => {
        item.addEventListener('click', () => {
          location.href = '/mesage';
        }, false);
      });

      this.$commonHeader.querySelectorAll('.goPersonal').forEach(item => {
        item.addEventListener('click', () => {
          location.href = '/personal/userManagement';
        }, false);
      });
      this.$loginBtn.addEventListener('click', e => {
        location.href = '/login';
      });
      this.$registerBtn.addEventListener('click', e => {
        location.href = '/register';
      });

      this.$registerBtn.addEventListener('mouseover', e => {
        this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big u-8-cl u-8-bd';
      });
      this.$registerBtn.addEventListener('mouseout', e => {
        this.$registerBtn.className = 'common-button header-reg-button common-button-hollow-big u-11-cl u-8-bd ';
      });
      this.$loginBtn.addEventListener('mouseover', e => {
        this.$loginBtn.className = 'common-button header-login-button common-button-text-kind u-11-cl u-12-bg';
      });
      this.$loginBtn.addEventListener('mouseout', e => {
        this.$loginBtn.className = 'common-button header-login-button common-button-text-kind u-11-cl';
      });
      this.$lanList.forEach(item => {
        item.addEventListener('mouseover', e => {
          const target = e.target;
          if (target.tagName === 'LI') {
            target.className = 'h-4-bg h-7-cl';
          }
        });

        item.addEventListener('mouseout', e => {
          const target = e.target;
          if (target.tagName === 'LI') {
            target.className = 'b-2-cl';
          }
        });

        item.addEventListener('click', e => {
          const target = e.target;
          const data = target.dataset;
          const datas = target.getAttribute('data-link');
          if (target.tagName === 'LI') {
            console.log(target);
            location.href = data.link ? data.link : datas;
          }
        });
      });


      this.$headerNavEven.addEventListener('click', e => {
        const target = e.target;
        const data = target.dataset;
        const link = data.link;
        const tar = data.target;
        const trades = data.trades;
        const id = data.id;
        if (trades) {
          if (id === 'exTrade' && this.etfOpen) {
            myStorage.set('markTitle', '');
            myStorage.set('sSymbolName', '');
          }
        }
        if (tar === 'black') {
          window.open(link);
        } else {
          window.location.href = link;
        }
      }, false);

      this.$headerNavEven.addEventListener('mouseout', () => {
        this.headerNavEvenList.forEach(item => {
          item.className = 'header-navEven';
        });
      }, false);
      this.$headerNavEven.addEventListener('mouseover', e => {
        const target = e.target;
        this.headerNavEvenList.forEach(item => {
          item.className = 'header-navEven';
        });
        if (target.className === 'header-navEven') {
          target.className = 'header-navEven h-7-cl';
        }
      }, false);

      this.$headerCusNav.addEventListener('mouseover', e => {
        const target = e.target;
        if (target.tagName === 'A') {
          target.className = 'h-4-bg h-7-cl';
        }
      }, false);
      this.$headerCusNav.addEventListener('mouseout', e => {
        const target = e.target;
        if (target.tagName === 'A') {
          target.className = 'x-2-cl g-3-cl-h';
        }
      }, false);
    }

    login() {
      fetch('/fe-ex-api/common/user_info', {
        method: 'post',
        headers: {
          'exchange-token': getCookie('token'),
          'exchange-language': getCookie('lan'),
        },
      }).then(res => {
        return res.json();
      }).catch(error => {
      })
        .then(data => {
          if (data) {
            if (!Number(data.code)) {
              window.emitter.emit('login');
              const $loginSet = this.$commonHeader.querySelectorAll('.login-set');
              $loginSet.forEach(target => {
                target.style.display = 'block';
              });
              const $unloginSet = this.$commonHeader.querySelectorAll('.unlogin-set');
              $unloginSet.forEach(target => {
                target.style.display = 'none';
              });
              this.$commonHeader.querySelector('.userText').innerHTML = data.data.userAccount;

              this.$commonHeader.querySelector('.userStatus').innerHTML = `${this.locale.userStatus}: ${this.userState[Number(data.data.accountStatus)]}`;
            }
          }
        });
    }

    getMessage() {
      fetch('/fe-ex-api/message/v4/get_no_read_message_count', {
        method: 'post',
        headers: {
          'exchange-token': getCookie('token'),
          'exchange-language': getCookie('lan'),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          uaTime: formatTime(new Date().getTime()),
        }),
      }).then(res => {
        return res.json();
      }).catch(error => {
      })
        .then(data => {
          if (!Number(data.code)) {
            if (data.data.noReadMsgCount) {
              const $headerUserMessage = this.$commonHeader.querySelector('.header-user-message');
              this.$commonHeader.querySelector('#messageMore').style.display = 'block';
              $headerUserMessage.classList.add('message-list');
              const userMessageList = data.data.userMessageList;
              let _html = '';
              userMessageList.forEach(item => {
                _html += `<li class="x-2-cl mesageNav">
                                    ${item.messageContent}
                                </li>`;
              });
              $headerUserMessage.querySelector('.header-user-text').innerHTML = _html;
            }
          }
        });
    }

    getData() {
      this.login();
      this.getMessage();
    }

    initColorDiaolog() {
      this.$colorList.forEach(item => {
        if (item.dataset.checked) {
          item.classList.add('checked');
        }
      });
      this.colorDialog = new BlockChainDialog({
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

      const $DialogColorList = this.colorDialog.dialog.querySelectorAll('.colorList li');
      $DialogColorList.forEach((item, inx) => {
        item.addEventListener('click', e => {
          if (!item.classList.contains('checked')) {
            $DialogColorList.forEach(el => {
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
