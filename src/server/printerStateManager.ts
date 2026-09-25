export class PrinterStateManager {
  private printerIp: string;
  private printerSettings: any;

  constructor(initialIp: string, initialSettings: any) {
    this.printerIp = initialIp || '127.0.0.1';
    this.printerSettings = initialSettings || {
      bill: { connectionType: 'LPT', usbPort: 'LPT1:' },
      kitchen: { connectionType: 'IP', ip: '127.0.0.1', port: 9100 }
    };
  }

  getKitchenSettings() {
    return this.printerSettings.kitchen || {};
  }

  getBillSettings() {
    return this.printerSettings.bill || {};
  }

  getPrinterIp() {
    return this.printerIp;
  }

  setPrinterIp(ip: string) {
    this.printerIp = ip;
  }

  updateBillSettings(settings: any) {
    this.printerSettings.bill = { ...this.printerSettings.bill, ...settings };
  }

  updateKitchenSettings(settings: any) {
    this.printerSettings.kitchen = { ...this.printerSettings.kitchen, ...settings };
  }

  getAllSettings() {
    return this.printerSettings;
  }
}
