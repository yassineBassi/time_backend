import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Client } from 'src/mongoose/client';
import { Store } from 'src/mongoose/store';
import { StoreService } from '../store/store.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel('Client')
    private readonly clientModel: Model<Client>,
    @InjectModel('Store')
    private readonly storeModel: Model<Store>,
    @Inject()
    private readonly storeService: StoreService,
  ) {}

  async toggleFavorite(storeId: string, user: Client) {
    const client = await this.clientModel.findById(user.id);
    const store = await this.storeModel.findById(storeId);

    if (client.favotiteStores.includes(store.id)) {
      const index = client.favotiteStores.indexOf(store.id);
      client.favotiteStores = [
        ...client.favotiteStores.slice(0, index),
        ...client.favotiteStores.slice(index + 1, client.favotiteStores.length),
      ];
    } else {
      client.favotiteStores.push(store.id);
    }

    await client.save();

    return {
      success: true,
    };
  }

  async getFavorites(user: Client) {
    const client = await this.clientModel.findById(user.id).populate({
      path: 'favotiteStores',
      populate: this.storeService.defaultPopulate,
      select: this.storeService.defaultSelect,
      match: this.storeService.defaultFilter,
    });

    const stores = (
      await this.storeService.addFieldsToStores(
        client.favotiteStores as any,
        client,
      )
    ).map((s) => ({
      ...s,
      isFavorite: true,
    }));

    return stores;
  }
}
