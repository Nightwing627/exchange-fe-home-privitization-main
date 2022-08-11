// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCompress = require('../../../app/middleware/compress');
import ExportConditional = require('../../../app/middleware/conditional');
import ExportEtag = require('../../../app/middleware/etag');

declare module 'egg' {
  interface IMiddleware {
    compress: typeof ExportCompress;
    conditional: typeof ExportConditional;
    etag: typeof ExportEtag;
  }
}
