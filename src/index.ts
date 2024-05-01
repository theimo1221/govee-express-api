import express, { Express } from 'express';
import { RestService } from './rest-service';
import { GoveeService } from './govee-service';
export class GoveeExpressApi {
  public static readonly app: Express = express();
  public static async start(): Promise<void> {
    console.log("Starting Govee Express API");
    GoveeService.initialize(true);
    RestService.initialize(this.app, 3000);
  }
}


void GoveeExpressApi.start();

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}\n${err.stack}`);
  process.exit(1);
});
