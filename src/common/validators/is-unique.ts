import { InjectConnection } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { access } from 'fs';
import { Connection } from 'mongoose';

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments) {
    console.log(value);
    console.log(args.object['id']);

    const [modelNames, fieldName, exceptions] = args.constraints;

    const exptionsFilter =
      exceptions && exceptions.length
        ? exceptions.reduce(
            (acc: any, curr: any) => ({
              ...acc,
              [curr.modelField]: { $ne: args.object[curr.dtoField] },
            }),
            {},
          )
        : {};

    console.log(exptionsFilter);

    let exists = false;
    for (let i = 0; i < modelNames.length; i++) {
      const model = this.connection.models[modelNames[i]];
      const count = await model
        .countDocuments({ [fieldName]: value, ...exptionsFilter })
        .exec();

      console.log('filter : ', { [fieldName]: value, ...exptionsFilter });
      console.log('count : ', count);
      if (count > 0) {
        exists = true;
        break;
      }
    }

    return !exists;
  }
}

export function IsUnique(
  modelNames: string[],
  fieldName: string,
  exceptions?: {
    dtoField: string;
    modelField: string;
  }[],
  validationOptions?: ValidationOptions,
) {
  validationOptions = { ...{ message: 'uniqueRow' }, ...validationOptions };
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: (validationOptions = {
        ...{ message: 'uniqueRow' },
        ...validationOptions,
      }),
      constraints: [modelNames, fieldName, exceptions],
      validator: IsUniqueConstraint,
    });
  };
}
