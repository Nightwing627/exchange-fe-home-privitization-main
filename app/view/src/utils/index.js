import { imgMap } from '@knoxexchange/blockchain-ui-privatization/lib/utils';
import imgMapObj from './imgMap.json';
const imgMapSlove = imgMap(imgMapObj[1], process.env.BASE_URL);

export { imgMapSlove as imgMap };

export {
  setCoMarket,
  setDefaultMarket,
  setLeverDefaultMarket,
  logImg,
  add, // 加法
  cut, // 减法
  division, // 乘法
  nul, // 除法3
  fixRate,
  formatTime,
  fixD,
  diff,
  lastD,
  fixUrl,
  fixInput,
  getScript,
  getComplexType,
  getTime,
  timeFn,
  fixFloat,
  getHex,
  routerEnv,
  colorMap,
  myStorage,
  browser,
  getLocationLang,
  getCoinShowName,
  thousandsComma,
  getCountryList,
  templateConfig,
  setCookie,
  getCookie,
  removeCookie,
} from '@knoxexchange/blockchain-ui-privatization/lib/utils';
