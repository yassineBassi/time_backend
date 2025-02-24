import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientSchema } from 'src/mongoose/client';
import { ModelService } from './model.service'; // Adjust path as necessary
import { IsUniqueConstraint } from './validators/is-unique';
import { ExistsConstraint } from './validators/exists';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Client', schema: ClientSchema }]),
  ],
  providers: [ModelService, IsUniqueConstraint, ExistsConstraint],
  exports: [ModelService, IsUniqueConstraint, ExistsConstraint],
})
export class SharedModule {}
