import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as configcat from 'configcat-node';

@Injectable()
export class ConfigcatService {
    constructor(private readonly config:ConfigService){}
    private readonly configcatclient = configcat.getClient(
        this.config.get("CONFIG_SDK_KEY"),
      );

      async allowRegIfDiffPhonesFlag() {
        return this.configcatclient.getValueAsync('ALLOW_REG_IF_DIFF_PHONES', false)
      }

      async sageCloudApiPublicKey() {
        return this.configcatclient.getValueAsync('SAGE_V3_API_PUBLIC_KEY', "")
      }

      async sageCloudApiSecretKey() {
        return this.configcatclient.getValueAsync('SAGE_V3_API_SECRET_KEY', "")
      }
}
