import { InjectConnection } from '@nestjs/mongoose';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Connection } from 'mongoose';

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  
  constructor(
    @InjectConnection() private readonly connection: Connection
  ){}

  async validate(value: any, args: ValidationArguments) {
    const [modelName, fieldName] = args.constraints;
    const model = this.connection.models[modelName];
    const count = await model.countDocuments({ [fieldName]: value }).exec();
    return count === 0;

  }
}

export function IsUnique(modelName: string, fieldName: string, validationOptions?: ValidationOptions) {
  validationOptions = { ...{ message: 'uniqueRow' }, ...validationOptions };
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions = { ...{ message: 'uniqueRow' }, ...validationOptions },
      constraints: [modelName, fieldName],
      validator: IsUniqueConstraint,
    });
  };
}