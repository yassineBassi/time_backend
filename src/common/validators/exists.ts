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
export class ExistsConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments) {
    const [modelName, fieldName, exceptions] = args.constraints;

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

    let count = 0;
    try {
      const model = this.connection.models[modelName];
      count = await model
        .countDocuments({ [fieldName]: value, ...exptionsFilter })
        .exec();
    } catch (e) {
      console.log(e);
    }

    return !!count;
  }
}

export function Exists(
  modelName: string,
  fieldName: string,
  exceptions?: {
    dtoField: string;
    modelField: string;
  }[],
  validationOptions?: ValidationOptions,
) {
  validationOptions = { ...{ message: 'existsRow' }, ...validationOptions };
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: (validationOptions = {
        ...{ message: 'existsRow' },
        ...validationOptions,
      }),
      constraints: [modelName, fieldName, exceptions],
      validator: ExistsConstraint,
    });
  };
}
