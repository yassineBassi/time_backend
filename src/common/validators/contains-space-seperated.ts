import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ContainsSpaceSeparatedValues(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'containsSpaceSeparatedValues',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log('--------------------------');
          console.log(
            typeof value === 'string' && value.split(' ').length == 2,
          );
          console.log(typeof value === 'string');
          console.log(value);
          console.log(value.split(' '));
          console.log(value.split(' ').length);
          console.log(value.split(' ').length == 2);
          return true;
          /*return (
            typeof value === 'string' &&
            value.split(' ').length == 2 &&
            /^[a-zA-Z ]+$/.test(value)
          );*/
        },
      },
    });
  };
}
