window.previewSkin = null;
try {
  previewSkin = JSON.parse(window.name).skin;
} catch (e) {

}
(function (window, document) {
  if (window.location.href.indexOf('isapp=1') !== -1) {
    window.isApp = true
  } else {
    window.isApp = false
  }
  try {
    JSON.parse(localStorage.myStorage);
  } catch (e) {
    localStorage.clear();
    localStorage.myStorage = '{}';
  }
  var localTime = Number(localStorage.localTime);
  if (!localTime || localTime !== new Date(window.updateDate).getTime() && window.evn !== 'development') {
    localStorage.clear();
    localStorage.myStorage = '{}';
    localStorage.localTime = new Date(window.updateDate).getTime();
  }
  function xssCheck(str, reg) {
    return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function (a, b) {
      if (b) {
        return a;
      } else {
        return {
          '<': '&lt;',
          '&': '&amp;',
          '"': '&quot;',
          '>': '&gt;',
          "'": '&#39;',
        }[a]
      }
    }) : '';
  }
  var getCookie = function (name) {
    var arrd = null;
    var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    if (document.cookie.match(reg)) {
      arrd = document.cookie.match(reg);
      return unescape(arrd[2]);
    }
    return null;
  };
  var defLan = '';
  if (window.publicInfo) {
    defLan = window.publicInfo.lan.defLan;
  }
  var lan = getCookie('lan') || defLan || 'zh_CN';
  var className = window.location.href.match(/[a-z]+_[A-Z]+/)[0];
  //函数：获取尺寸

  var publicInfo = window.publicInfo;
  var setLan = function setLan() {
    var body = document.querySelector('body');
    var bodyClass = body.className;
    if (className) {
      bodyClass = bodyClass + ' ' + className;
    }
    body.className = bodyClass;
    window.htmlInitLan = true;
  };
  if (lan) {
    setLan();
  }
  var myStorage = JSON.parse(localStorage.myStorage);
  var themeList = null;
  var theme = null;
  var createTheme = function createTheme(skinData) {
    var createStyle = function createStyle(theme) {
      var colorList = theme.colorList;
      var style = "";
      var colorsMap = {};
      for (var i = 0, len = colorList.length; i < len; i++) {
        var li = colorList[i];
        var colors = li.rgba;
        for (var j = 0, jlen = colors.length; j < jlen; j++) {
          var color = xssCheck(colors[j]);
          colorsMap[li.type + '-' + (j + 1) + '-bg'] = 'rgba(' + color + ')';
          colorsMap[li.type + '-' + (j + 1) + '-bd'] = 'rgba(' + color + ')';
          colorsMap[li.type + '-' + (j + 1) + '-cl'] = 'rgba(' + color + ')';
          style += '.' + li.type + '-' + (j + 1) + '-' + 'bg{background-color:rgba(' + color + ') !important;}';
          style += '.' + li.type + '-' + (j + 1) + '-' + 'bd{border-color:rgba(' + color + ') !important;}';
          style += '.' + li.type + '-' + (j + 1) + '-' + 'cl{color:rgba(' + color + ') !important;}';
          style += '.' + li.type + '-' + (j + 1) + '-' + 'cl-h:hover{background-color:rgba(' + color + ') !important;}';
          style += '.' + li.type + '-' + (j + 1) + '-' + 'f-h:hover{color:rgba(' + color + ') !important;}';
        }
      }
      if (previewSkin) {
        window.previewColorsMap = colorsMap;
      } else {
        window.colorMap = colorsMap;
        myStorage.colorMap = colorsMap
      }
      var imgList = theme.imgList;
      for (var key in imgList) {
        imgList[key] = xssCheck(imgList[key]);
        const result = /^(https|http)/.test(imgList[key])
        imgList[key] = result ? imgList[key] : theme.imgPath + imgList[key];
      }
      if (previewSkin) {
        window.previewImgMap = imgList;
      } else {
        window.imgMap = theme.imgList;
        myStorage.imgMap = theme.imgList;
      }
      var iconUrl = xssCheck(theme.iconUrl);
      if (iconUrl) {
        var oldIconfont = document.querySelector('#iconfont');
        var head = document.querySelector('head');
        head.removeChild(oldIconfont);
        var iconfont = document.createElement('script');
        iconfont.src = iconUrl;
        head.appendChild(iconfont);
      }
      if (localStorage.setItem) {
        localStorage.setItem('myStorage', JSON.stringify(myStorage))
      }
      var styleEle = document.createElement('style');
      var head = document.querySelector('head');
      styleEle.innerHTML = style;
      head.appendChild(styleEle);
    };
    if (previewSkin) {
      createStyle(skinData);
      if(skinData.othersCss){
        createCss(skinData.othersCss)
      }
    } else {
      if (skinData) {
        themeList = skinData.listist;
        if (Object.prototype.toString.call(themeList) === '[object Array]') {
          for (var i = 0, len = themeList.length; i < len; i++) {
            if (themeList[i].skinId === defSkin) {
              theme = themeList[i];
            }
          }
          createStyle(theme);
          if(theme.othersCss){
            createCss(theme.othersCss)
          }
        }
      }
    }
  };
  var createCss = function createCss(url) {
    var cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    cssLink.href = url;
    var headDom = document.getElementsByTagName('head')[0]
    headDom.appendChild(cssLink);
  }
  if (previewSkin) {
    createTheme(previewSkin);

    if (previewSkin.othersCss) {
      createCss(previewSkin.othersCss)
    }
  } else {
    if (publicInfo) {
      var skin = publicInfo.skin || {};
      var className = lan;
      var defSkin = skin.default || '1';
      var cusSkin = getCookie('cusSkin');
      if (cusSkin) {
        defSkin = cusSkin;
      }
      createTheme(skin);
    }
  }

})(window, document);