import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  Inject,
  Post,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { LoggerService } from '@tribe-telegram-app/shared';
import tokenConfig from 'libs/shared/src/lib/configs/token.config';
import { verifySignature } from './classes/signing';
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
    @Body() body,
    @Headers('X-Tribe-Request-Timestamp') tribeRequestTimeStamp: number,
    @Headers('X-Tribe-Signature') tribeSignature: string
  ) {
    this._logger.debug('New webhook received');
    this._logger.verbose(body);

    this._logger.debug('X-Tribe-Request-Timestamp ' + tribeRequestTimeStamp);
    this._logger.debug('X-Tribe-Signature ' + tribeSignature);

    var difference = tribeRequestTimeStamp - Date.now() / 1000 / 60;
    this._logger.debug('difference ' + tribeSignature);
    if (difference > 15) {
      // greater than 15 minutes
      throw new ConflictException('dropping webhooks older than 15 minutes');
    }

    const entity = this._webhookService.getWebhookAuditById(body.data.id);
    if (entity) {
      throw new ConflictException(
        'This webhook was recieved before. droping it.'
      );
    }

    let saveEntity = new WebhookAuditEntity();
    saveEntity.id = body.data.id;
    saveEntity.actorId = body.data.actor.id;
    saveEntity.name = body.data.name;
    saveEntity.objectId = body.object.id;
    saveEntity.targetNetworkId = body.target.networkId;

    await this._webhookService.saveWebhookAudit(saveEntity);

    if (
      !verifySignature({
        signature: tribeSignature,
        secret: this._tokenConfigService.signingSecret,
        timestamp: tribeRequestTimeStamp,
        body: body,
      })
    ) {
      throw new BadRequestException(
        'Signature problem, please provide right signature'
      );
    }

    switch (body.type) {
      case HookTypes.TEST: {
        return this._webhookService.testHookHandler(body);
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
