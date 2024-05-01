import cors from 'cors';
import { Express, json } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { GoveeService } from './govee-service';
import { GoveeApiDevice } from './govee-api-device';

interface CustomHandler {
  path: string;
  handler: RequestHandler[];
}

export class RestService {
  public static addCustomEndpoint(path: string, ...handler: RequestHandler[]) {
    if (this._initialized) {
      this.app.get(path, handler);
      return;
    }
    this._queuedCustomHandler.push({ path, handler });
  }

  public static get app(): Express {
    return this._app;
  }

  private static _app: Express;
  private static _initialized: boolean = false;
  private static _queuedCustomHandler: CustomHandler[] = new Array<CustomHandler>();

  public static initialize(app: Express, port: number = 3000): void {
    this._app = app;

    this._app.use(
      cors({
        origin: '*',
      }),
    );

    this.app.use(json());

    this._app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });

    this._app.get('/isAlive', (_req, res) => {
      res.send(`Govee-Express-API active ${new Date()}`);
    });

    this._app.get('/devices', (_req, res) => {
      return res.send(GoveeService.devices);
    })

    this._app.get('/device/:deviceId', (_req, res) => {
      const dev: GoveeApiDevice | undefined = GoveeService.device(_req.params.deviceId);
      if (dev === undefined) {
        return res.status(404).send('Device not found or not yet ready');
      }
      return res.send(dev.toJSON());
    })

    this._app.get('/device/:deviceId/brightness/:brightness', async (_req, res) => {
      console.log(`API Requested brightness: ${_req.params.brightness} for device ${_req.params.deviceId}`);
      const dev: GoveeApiDevice | undefined = GoveeService.device(_req.params.deviceId);
      if (dev === undefined) {
        return res.status(404).send('Device not found or not yet ready');
      }
      const brightness: number = parseInt(_req.params.brightness);
      if (isNaN(brightness)) {
        return res.status(400).send('Invalid brightness');
      }
      dev.setBrightness(brightness).catch((err) => {
        return res.send(err);
      }).then(() => {
        return res.status(200).send();
      });
    })

    this._app.get('/device/:deviceId/color/:color', async (_req, res) => {
      console.log(`API Requested color: ${_req.params.color} for device ${_req.params.deviceId}`);
      const dev: GoveeApiDevice | undefined = GoveeService.device(_req.params.deviceId);
      if (dev === undefined) {
        return res.status(404).send('Device not found or not yet ready');
      }
      dev.setColor(_req.params.color).catch((err) => {
        return res.send(err);
      }).then(() => {
        return res.status(200).send();
      });
    })

    this._app.get('/device/:deviceId/on/:state', async (_req, res) => {
      console.log(`API Requested on: ${_req.params.state} for device ${_req.params.deviceId}`);
      const dev: GoveeApiDevice | undefined = GoveeService.device(_req.params.deviceId);
      if (dev === undefined) {
        return res.status(404).send('Device not found or not yet ready');
      }
      if(_req.params.state === 'true') {
        dev.turnOn().catch((err) => {
          return res.send(err);
        }).then(() => {
          return res.status(200).send();
        });
      } else {
        dev.turnOff().catch((err) => {
          return res.send(err);
        }).then(() => {
          return res.status(200).send();
        });
      }
    })

    this._initialized = true;
    for (const handler of this._queuedCustomHandler) {
      this._app.get(handler.path, handler.handler);
    }
  }

  // private static getClientInfo(req: Request): string {
  //   return `Client (user-agent: "${req.headers['user-agent']}", ip: ${req.ip})`;
  // }
  //
  // private static getIntParameter(
  //   parameterValue: string | undefined,
  //   negativeAsUndefined: boolean = false,
  // ): number | undefined {
  //   if (parameterValue === undefined) {
  //     return undefined;
  //   }
  //   const parsedValue = parseInt(parameterValue);
  //   if (isNaN(parsedValue)) {
  //     return undefined;
  //   }
  //   if (negativeAsUndefined && parsedValue < 0) {
  //     return undefined;
  //   }
  //   return parsedValue;
  // }
}
