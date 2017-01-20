export class FileMetaData{
    name: string;
    tag: string;
    contentLength: number = 0;
    progressInPercent: number = 0;
    isDownloading: boolean;
    isTransfering: boolean;
    shareClicked: boolean;
}
