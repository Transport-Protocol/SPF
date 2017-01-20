import { OpaqueToken } from "@angular/core";

export let APP_CONFIG = new OpaqueToken("app.config");

export interface IAppConfig {
  apiEndpoint: string;
}

export const AppConfig: IAppConfig = {
  //apiEndpoint: "https://ec2-54-93-97-126.eu-central-1.compute.amazonaws.com:8080/api/"
  //apiEndpoint: "http://localhost:8080/api/"
  apiEndpoint: "https://servicecompo.ddns.net:8080/api/"
};
