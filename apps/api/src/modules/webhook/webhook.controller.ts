import {
  BadRequestException,
  ConflictException,
  Controller,
  Headers,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerService } from '@tribe-telegram-app/shared';
import tokenConfig from 'libs/shared/src/lib/configs/token.config';
import { v4 as uuidv4 } from 'uuid';
import { verifySignature } from './classes/signing';
import { HookTypes } from './constants/hook-types.enum';
import { WebhookAuditEntity } from './entities/webhook-audit.entity';
import { WebhookService } from './webhook.service';
@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly _logger: LoggerService,
    private readonly _webhookService: WebhookService,
    @Inject(tokenConfig.KEY)
    private readonly _tokenConfigService: ConfigType<typeof tokenConfig>
  ) {
    this._logger.setContext(WebhookController.name);
  }

  @Post()
  async webhookHandler(
    @Req() req,
    @Headers('X-Tribe-Request-Timestamp') tribeRequestTimeStamp: number,
    @Headers('X-Tribe-Signature') tribeSignature: string
  ) {
    const body = req.body;
    const rawBody = req.rawBody;

    this._logger.debug('New webhook received');
    this._logger.verbose(body);

    this._logger.debug('Body data is, ');
    this._logger.verbose(body.data);

    this._logger.debug('X-Tribe-Request-Timestamp ' + tribeRequestTimeStamp);
    this._logger.debug('X-Tribe-Signature ' + tribeSignature);

    var difference = (tribeRequestTimeStamp - Date.now()) / 1000 / 60;
    this._logger.debug('difference ' + difference);
    if (difference > 15) {
      // greater than 15 minutes
      throw new ConflictException('dropping webhooks older than 15 minutes');
    }

    if (body.data?.id) {
      const entity = await this._webhookService.getWebhookAuditById(
        body.data.id
      );
      this._logger.log('Verifying replays, ' + JSON.stringify(entity));
      if (entity) {
        throw new ConflictException(
          'This webhook was recieved before. droping it.'
        );
      }
    }

    let saveEntity = new WebhookAuditEntity();
    saveEntity.id = body.data?.id || uuidv4();
    saveEntity.actorId = body.data?.actor?.id || '';
    saveEntity.type = body.type || 'UNKNOWN';
    saveEntity.name = body.data?.name || '';
    saveEntity.objectId = body.object?.id || '';
    saveEntity.targetNetworkId = body.target?.networkId || body.networkId || '';

    await this._webhookService.saveWebhookAudit(saveEntity);

    this._logger.debug('Verifying signature');
    if (
      !verifySignature({
        signature: tribeSignature,
        secret: this._tokenConfigService.signingSecret,
        timestamp: tribeRequestTimeStamp,
        body: rawBody,
      })
    ) {
      throw new BadRequestException(
        'Signature problem, please provide right signature'
      );
    }

    this._logger.debug('Signature verfied succesfully');

    switch (body.type) {
      case HookTypes.TEST: {
        this._logger.debug('Test Webhook received');
        const ret = this._webhookService.testHookHandler(body);
        this._logger.debug('Return this object: ' + JSON.stringify(ret));
        return ret;
      }
      case HookTypes.SUBSCRIPTION: {
        if (body.data.name === 'post.published') {
          return await this._webhookService.postPublishHandler(
            saveEntity.objectId
          );
        }
      }
    }
  }
}
