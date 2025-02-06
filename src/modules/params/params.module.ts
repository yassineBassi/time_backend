import { Module } from '@nestjs/common';
import { ParamsService } from './params.service';
import { ParamsController } from './params.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ParameterSchema } from 'src/mongoose/parameter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Parameter', schema: ParameterSchema }]),
  ],
  controllers: [ParamsController],
  providers: [ParamsService],
  exports: [ParamsService],
})
export class ParamsModule {}
