import { InjectConnection } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Connection } from 'mongoose';

@ValidatorConstraint({ async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments) {
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

    let exists = false;
    for (let i = 0; i < modelNames.length; i++) {
      console.log('---------------------');
      console.log(modelNames[i]);
      const model = this.connection.models[modelNames[i]];
      const count = await model
        .countDocuments({ [fieldName]: value, ...exptionsFilter })
        .exec();
      console.log(count);
      console.log(
        await model.find({ [fieldName]: value, ...exptionsFilter }).exec(),
      );

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
