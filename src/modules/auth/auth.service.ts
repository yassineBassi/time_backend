import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from 'src/mongoose/client';
import { OtpToken } from 'src/mongoose/otp-token';
import { RegisterClientDTO } from './dtos/register-client.dto';
import * as bcrypt from 'bcrypt';
import { StoreSection } from 'src/mongoose/store-section';
import { StoreCategory } from 'src/mongoose/store-category';
const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {


    constructor(
        @InjectModel('Client') 
        private readonly clientModel: Model<Client>,
        @InjectModel('OtpToken') 
        private readonly OtpTokenModel: Model<OtpToken>,
    ){}

    generateRandomDigits(length: number): string {
        let result = '';
        for (let i = 0; i < length; i++) {
          result += Math.floor(Math.random() * 10);
        }
        return result;
      }

    async registerClient(registerClientDTO: RegisterClientDTO){

       let client = new this.clientModel(registerClientDTO);

       const salt = await bcrypt.genSalt(SALT_ROUNDS);
       const hashedPassword = await bcrypt.hash(client.password, salt);
       client.password = hashedPassword;

       client = await client.save();
       console.log(client);

       await (new this.OtpTokenModel({
            code: this.generateRandomDigits(5),
            expireDate: new Date(new Date().getTime() + 5 * 60 * 1000),
            user: client.id
        })).save();

        return client;
    }

    async registerStore(registerClientDTO: RegisterClientDTO){
        const client = new this.clientModel(registerClientDTO);
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(client.password, salt);
        client.password = hashedPassword;
        const response = await client.save();
        console.log(response);
    }
}
