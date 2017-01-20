/**
 * Created by PhilippMac on 19.01.17.
 */
import { Pipe, PipeTransform } from '@angular/core';

/*
 * Convert bytes into largest possible unit.
 * Takes an precision argument that defaults to 2.
 * Usage:
 *   bytes | fileSize:precision
 * Example:
 *   {{ 1024 |  fileSize}}
 *   formats to: 1 KB
 */
@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {

  private units = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  transform(bytes: number = 0, precision: number = 2 ) : string {
    if ( isNaN( parseFloat( String(bytes) )) || ! isFinite( bytes ) ) return '?';
    let unit = 0;

    if(bytes < 1024){
      return bytes + ' bytes';
    }

    while ( bytes >= 1024 ) {
      bytes /= 1024;
      unit ++;
    }
    return bytes.toFixed( + precision ) + ' ' + this.units[ unit ];
  }
}
