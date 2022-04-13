import { createMock } from '@golevelup/ts-jest';
import { ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@tribe-telegram-app/shared';
import tokenConfig from 'libs/shared/src/lib/configs/token.config';
import { WebhookAuditEntity } from './entities/webhook-audit.entity';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import exp = require('constants');

jest.mock('./webhook.service.ts');

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(tokenConfig)],
      providers: [WebhookService, LoggerService],
      controllers: [WebhookController],
    })
      .overrideProvider(LoggerService)
      .useValue(createMock<LoggerService>())
      .overrideProvider(tokenConfig.KEY)
      .useValue({})
      .compile();

    controller = module.get<WebhookController>(WebhookController);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  describe('Definition', () => {
    it('controller should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('webhookService should be defined', () => {
      expect(webhookService).toBeDefined();
    });
  });

  const requestStub = {
    body: {
      data: {
        id: '123',
      },
    },
  };

  const webhookAuditEntityStub: WebhookAuditEntity = {
    id: '123',
    actorId: '123',
    name: 'name',
    objectId: '123',
    receivedAt: new Date(),
    targetNetworkId: '123',
    type: 'someType',
  };

  describe('webhookHandler', () => {
    it('Should throw error if timestamp more than 15 minutes', async () => {
      try {
        const moreThan15MinuteBefore = Date.now() - 1000 * 60 * 16;
        await controller.webhookHandler(
          requestStub,
          moreThan15MinuteBefore,
          'Some Signature'
        );
      } catch (error) {
        expect(error.response.message).toBe(
          'dropping webhooks older than 15 minutes'
        );
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it('Should throw error if replaying occured', async () => {
      try {
        const spy = jest
          .spyOn(webhookService, 'getWebhookAuditById')
          .mockResolvedValue(webhookAuditEntityStub);
        const moreThan15MinuteBefore = Date.now();

        await controller.webhookHandler(
          requestStub,
          moreThan15MinuteBefore,
          'Some Signature'
        );
      } catch (error) {
        console.log(error);
        expect(error.response.message).toBe(
          'This webhook was recieved before. droping it.'
        );
        expect(error).toBeInstanceOf(ConflictException);
      }
    });

    it.todo('Should throw error if signature not verified');

    it.todo(
      'Should return correct test result when received TEST type webhook'
    );

    it.todo(
      'Should call postPublishedHandler of webhook service if SUBSCRIPTION of post.published received from api'
    );
  });
});
