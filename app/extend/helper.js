const recommend = {
  itemWidth(length) {
    if (!length){
      return "{}";
    }
    return JSON.stringify({
      width: `${length * 300 - 20}px`
    });
  },
  getCoinShowName(name, coinList = {}) {
    if (name && coinList && coinList[name.toUpperCase()]) {
      return coinList[name.toUpperCase()].showName || name;
    }
    return name;
  },
  symbolIcon(data, coinList){
    const coin = data.split('/')[0];
    const iconImg = coinList[coin] ? coinList[coin].icon : '';
    return iconImg;
  },
  setSymbol(showData, type) {
    if (type === 'b') {
      return ` / ${showData.split('/')[1]}`;
    }

    return showData.split('/')[0];
  },
  symbolShow(index){
    return index < 5;
  },
  koreaSymbolShow(index){
    return index < 2;
  }
};

const footer = {
  logo(msg){
    if (msg){
      return msg.footer_logo_path || msg.logoUrl;
    }else{
      return '';
    }
  }
};

const swiper = {
  getInterMap(list){
    const len = 4;
    const imgMap = [];
    list.forEach((item, index) => {
      const mapKey = Math.ceil((index + 1) / len) - 1;
      if (!imgMap[mapKey]){
        imgMap[mapKey] = [];
      }
      imgMap[mapKey].push(item);
    });
    return imgMap;
  },
  getBigStyle(index){
    return !!(index % 4);
  },
  showNextBtn(len){
    return len > 4;
  }
};

const custom = {
  getIndexImg(val, index, sourceMap){
    return sourceMap[val + index];
  }
};

exports.swiper = swiper;

exports.footer = footer;

exports.recommend = recommend;

exports.custom = custom;
