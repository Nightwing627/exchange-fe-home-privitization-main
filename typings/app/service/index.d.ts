// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportGetAppDownLoad = require('../../../app/service/getAppDownLoad');
import ExportGetBannerIndex = require('../../../app/service/getBannerIndex');
import ExportGetFooterHeader = require('../../../app/service/getFooterHeader');
import ExportGetFooterList = require('../../../app/service/getFooterList');
import ExportPublictInfo = require('../../../app/service/publictInfo');

declare module 'egg' {
  interface IService {
    getAppDownLoad: AutoInstanceType<typeof ExportGetAppDownLoad>;
    getBannerIndex: AutoInstanceType<typeof ExportGetBannerIndex>;
    getFooterHeader: AutoInstanceType<typeof ExportGetFooterHeader>;
    getFooterList: AutoInstanceType<typeof ExportGetFooterList>;
    publictInfo: AutoInstanceType<typeof ExportPublictInfo>;
  }
}
