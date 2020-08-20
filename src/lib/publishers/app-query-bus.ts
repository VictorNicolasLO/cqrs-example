import { QueryBus, IQuery, IQueryResult } from '@nestjs/cqrs';
import { ModuleRef } from '@nestjs/core';
import {
  Injectable,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { rabbitPrefix } from '../../const';
import { KafkaBroker } from '../brokers/kafka';

@Injectable()
export class AppQueryBus extends QueryBus {
  private handlersClasses: any[];
  private _domainName: string;
  set domainName(value: string) {
    new KafkaBroker({ groupId: value }, true);
    this._domainName = value;
  }
  get domainName() {
    return this._domainName;
  }

  async execute<T extends IQuery, TResult extends IQueryResult>(
    command: T,
  ): Promise<TResult> {
    const broker = new KafkaBroker({ groupId: this.domainName }, true);
    const domainName = (command.constructor as any).domainName;
    const commandName = command.constructor.name;
    try {
      const result: any = await broker.request(
        rabbitPrefix + `queries.${domainName}.${commandName}`,
        { data: command },
      );
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async registerHandler(handler) {
    const instance = await (this as any).moduleRef.resolve(handler);
    if (!instance) {
      return;
    }
    const target = (this as any).reflectQueryName(handler);
    if (!target) {
      throw 'INVALID QUERY';
    }
    this.bind(instance, target.name);
  }

  bind(handler, name) {
    const broker = new KafkaBroker({ groupId: this.domainName }, true);
    broker.rpc(
      rabbitPrefix + `queries.${this.domainName}.${name}`,
      (msg: any) =>
        new Promise(async (resolve, reject) => {
          //  this.subject$.next(msg.data);
          try {
            const result = await handler.execute(msg.data);
            resolve(result);
          } catch (e) {
            Logger.error(e.message, e.trace, 'RPC consumer reponse');
            reject(e);
            throw e;
          }
        }),
    );
  }
}
