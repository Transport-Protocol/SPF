/**
 * Created by PhilippMac on 19.01.17.
 */
export class XhrProgress {

  bytes: number;
  total: number;

  constructor(bytes: number, total: number) {
    this.bytes = bytes;
    this.total = total;
  }

  public toString = () : string => {
    return `bytes: ` + this.bytes + ' total: ' + this.total;
  }
}
