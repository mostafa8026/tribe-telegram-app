import { INestApplication } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { DispatcherService } from './services/dispatcher.service';

export class TelegramServer extends Server implements CustomTransportStrategy {
  app: INestApplication;

  constructor(app: INestApplication) {
    super();
    this.app = app;
  }

  /**
   * This method is triggered when you run "app.listen()".
   */
  async listen(callback: () => void) {
    const dispatcher = this.app.get(DispatcherService);
    console.log('this.messageHandlers: ', this.messageHandlers);
    dispatcher.setPages(this.messageHandlers);

    callback();
  }

  /**
   * This method is triggered on application shutdown.
   */
  close() {
    return;
  }
}
