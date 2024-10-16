const colorConvert = require('color-convert');

let Service, Characteristic;

const PLUGIN_NAME = 'homebridge-virtual-homekey-lock';
const ACCESSORY_NAME = 'VirtualHomekeyLock';

class VirtualHomekeyLock {
  constructor(log, config, api) {
    this.log = log;
    this.config = config;
    this.api = api;

    this.name = config.name;
    this.serialNumber = config.serialNumber;
    this.keyColor = config.keyColor;

    this.lockService = new Service.LockMechanism(this.name);
    this.informationService = new Service.AccessoryInformation();

    this.lockService
      .getCharacteristic(Characteristic.LockCurrentState)
      .onGet(this.getLockState.bind(this));

    this.lockService
      .getCharacteristic(Characteristic.LockTargetState)
      .onGet(this.getLockState.bind(this))
      .onSet(this.setLockState.bind(this));

    this.setupHomeKey();
  }

  getLockState() {
    // Implementieren Sie hier die Logik zum Abrufen des Schlosszustands
    return Characteristic.LockCurrentState.SECURED;
  }

  setLockState(state) {
    // Implementieren Sie hier die Logik zum Setzen des Schlosszustands
    this.log.info('Lock state set to:', state);
    return state;
  }

  setupHomeKey() {
    const colorHex = this.getColorHex(this.keyColor);
    const keyData = Buffer.from(`01${colorHex}`, 'hex');
    
    this.lockService.setCharacteristic(
      Characteristic.NFCAccessControlPoint,
      keyData
    );
    
    this.lockService.setCharacteristic(
      Characteristic.NFCAccessSupportedConfiguration,
      this.serialNumber
    );
  }

  getColorHex(color) {
    const colorMap = {
      'Tan': '04CED5DA00',
      'Gold': '04AAD6EC00',
      'Silver': '04E3E3E300',
      'Black': '0400000000'
    };
    return colorMap[color] || '04E3E3E300'; // Standardmäßig Silber
  }

  getServices() {
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Virtual Manufacturer')
      .setCharacteristic(Characteristic.Model, 'Virtual HomeKey Lock')
      .setCharacteristic(Characteristic.SerialNumber, this.serialNumber);

    return [this.informationService, this.lockService];
  }
}

module.exports = (api) => {
  Service = api.hap.Service;
  Characteristic = api.hap.Characteristic;
  api.registerAccessory(PLUGIN_NAME, ACCESSORY_NAME, VirtualHomekeyLock);
};
