import { Application } from 'pinus';
import { dispatch } from '../../../util/dispatcher';
import { Cola } from '../../../../types/Cola';

export default function (app: Application) {
    return new Handler(app);
}

export class Handler {
    constructor(private app: Application) {

    }

    async getConnectorEntry(uid: string): Promise<Cola.Response.GateGetConnectorEntry> {
      console.log(`getConnectorEntry`);
      if (!uid) {
          return { code: 500, message: '缺少uid参数', data: null };
      }
      const connectors = this.app.getServersByType('connector');
      if (!connectors || connectors.length === 0) {
        return { code: 500, message: '没有可以连接的connector服务器', data: null };
      }
      // select connector
      const res = dispatch(uid, connectors);
      return {
        code: 200,
        message: '',
        data: {
          host: res.host,
          port: res.clientPort
        }
      };
    }
}
