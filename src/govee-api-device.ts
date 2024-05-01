import { Device as GoveeDevice, DeviceStateInfo as GoveeDeviceStateInfo } from '@j3lte/govee-lan-controller';
import { DeviceState as GoveeDeviceState } from '@j3lte/govee-lan-controller/build/types/device';
import { LogLevel } from './log-level';
import { RGB } from './r-g-b';
import { LogService } from './log-service';

export class GoveeApiDevice {
  private _actuatorOn: boolean = false;
  private _brightness: number = 0;
  private _color: string = '#fcba32';
  private _colortemp: number = 500;

  public constructor(
    public device: GoveeDevice | undefined,
  ) {
  }
  public get brightness(): number {
    return this._brightness;
  }

  public get color(): string {
    return this._color;
  }

  public get colortemp(): number {
    return this._colortemp;
  }

  public get actuatorOn(): boolean {
    return this._actuatorOn;
  }

  public log(level: LogLevel, message: string): void {
    LogService.writeLog(level, message);
  }

  public update(data: GoveeDeviceState & GoveeDeviceStateInfo): void {
    this._actuatorOn = data.onOff === 1;
    this._brightness = data.brightness;
    this._color = `#${data.color.r.toString(16)}${data.color.g.toString(16)}${data.color.b.toString(16)}`;
    this._colortemp = data.colorTemInKelvin;
  }

  public async setBrightness(brightness: number): Promise<void> {
    return this.guardedDevice.setBrightness(brightness);
  }

  public async setColor(hexColor: string): Promise<void> {
    const colors: RGB | null = RGB.hexToRgb(hexColor);
    if (colors === null) {
      throw new Error(`Invalid color: ${hexColor}`);
    }
    return this.guardedDevice.setColorRGB(colors);
  }

  public async turnOn(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.guardedDevice.turnOn().then(() => {
        resolve();
        this._actuatorOn = true;
      }).catch((err) => {
        reject(err);
      })
    })
  }

  public async turnOff(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.guardedDevice.turnOff().then(() => {
        resolve();
        this._actuatorOn = false;
      }).catch((err) => {
        reject(err);
      })
    })
  }

  private get guardedDevice(): GoveeDevice {
    if(this.device === undefined) {
      throw new Error(`Device not yet ready`);
    }
    return this.device;
  }

  public toJSON(): any {
    return {
      id: this.device?.id ?? null,
      actuatorOn: this.actuatorOn,
      brightness: this.brightness,
      hexColor: this.color,
      colortemp: this.colortemp,
    }
  }
}

