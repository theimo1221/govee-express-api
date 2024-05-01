import {
  Device as GoveeDevice,
  DeviceStateInfo as GoveeDeviceStateInfo,
  Govee,
  GoveeDeviceEventTypes,
  GoveeEventTypes,
} from '@j3lte/govee-lan-controller';
import { DeviceState as GoveeDeviceState } from '@j3lte/govee-lan-controller/build/types/device';
import {
  GoveeDeviceData,
  GoveeDeviceStatusData,
  GoveeResponseMessage,
} from '@j3lte/govee-lan-controller/build/types/types';
import { LogService } from './log-service';
import { LogLevel } from './log-level';
import { GoveeApiDevice } from './govee-api-device';

export class GoveeService {
  private static devicesDict: { [name: string]: GoveeDevice } = {};
  private static goveeApi: Govee;

  public static get devices(): { [id: string]: GoveeApiDevice } {
    return this.ownDevices;
  }

  private static ownDevices: { [id: string]: GoveeApiDevice } = {};

  public static device(id: string): GoveeApiDevice | undefined {
    return this.ownDevices[id];
  }

  public static initialize(debug: boolean = false, listenTo?: string): void {
    LogService.writeLog(LogLevel.Debug, 'Initializing Goovee-Service');
    this.goveeApi = new Govee({
      discover: true,
      discoverInterval: 300_000,
      debug: debug,
      listenTo: listenTo,
    });
    this.goveeApi.on(GoveeEventTypes.Scan, (data: GoveeDeviceData) => {
      LogService.writeLog(LogLevel.Info, `GoveeDevice ${data.ip} scanned`);
    });
    this.goveeApi.on(GoveeEventTypes.Ready, () => {
      LogService.writeLog(LogLevel.Info, 'Govee ready');
    });
    this.goveeApi.on(GoveeEventTypes.Error, (err) => {
      LogService.writeLog(LogLevel.Error, `Govee-Error: ${err}`);
    });
    this.goveeApi.on(GoveeEventTypes.NewDevice, (device: GoveeDevice) => {
      LogService.writeLog(LogLevel.Trace, `GoveeDevice ${device.id} joined`);
      GoveeService.initializeDevice(device);
    });
    this.goveeApi.on(GoveeEventTypes.UnknownDevice, (_data: GoveeDeviceStatusData) => {
      LogService.writeLog(LogLevel.Warn, 'GoveeDevice unknown');
    });
    this.goveeApi.on(GoveeEventTypes.UnknownMessage, (data: GoveeResponseMessage) => {
      LogService.writeLog(LogLevel.Warn, `GoveeDevice unknown message: ${data}`);
    });
    this.goveeApi.discover();
  }

  private static initializeDevice(d: GoveeDevice) {
    this.devicesDict[d.id] = d;
    if(this.ownDevices[d.id] === undefined) {
      this.ownDevices[d.id] = new GoveeApiDevice(d);
    }
    const ownDevice = this.ownDevices[d.id];
    ownDevice.device = d;
    ownDevice.update(d.getState());

    d.on(GoveeDeviceEventTypes.StateChange, (data: GoveeDeviceState & GoveeDeviceStateInfo) => {
      LogService.writeLog(LogLevel.Debug, `Govee ${d.id} state changed ${JSON.stringify(data)}`);
      this.updateDevice(d, data);
    });
    LogService.writeLog(LogLevel.Debug, `Govee ${d.id} found at address ${d.ipAddr}`);
  }

  private static updateDevice(device: GoveeDevice, data: GoveeDeviceState & GoveeDeviceStateInfo): void {
    if (this.ownDevices[device.id] === undefined) {
      LogService.writeLog(LogLevel.Alert, `Unknown Govee Device "${device.id}"`);
      return;
    }
    this.ownDevices[device.id].update(data);
  }
}
