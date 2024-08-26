import { I18nService } from 'nestjs-i18n';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Inject  } from '@nestjs/common';
import { Response } from 'express';
import { Logger } from 'winston';

@Catch(HttpException)
export class ResponseExceptionFilter implements ExceptionFilter {
    
    constructor(private readonly i18n: I18nService,  @Inject('winston') private readonly logger: Logger){}
    
    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const r = <any>exception.getResponse();

        this.logger.error(exception);

        if(typeof r.message == "string"){
            r.message = this.i18n.translate(r.message)
        }else if(status == 400) {
            r.message = await this.msg_validation(r.message)
        }
        
        console.log(r.message);
        response.status(status).send(r)
    }
    
    parseErrors(errors: any[]){
        return errors.reduce((acc: any, curr: any) => {
            const res = [...acc, ...(curr.children && curr.children.length ? this.parseErrors(curr.children) : [curr])]
            return res
        }, [])
    }
    
    async msg_validation(messages: any[]){
        const errors = this.parseErrors(messages).map((e: any) => ({
            property: e.property, 
            errors: Object.keys(e.constraints)
            .map(k => ({
                type: k,
                message: e.constraints[k]
            }))
        }))

        const result = {}
        for(const key of Object.keys(errors)){
            const messages = [];
            for(let error of errors[key].errors){
                error = await this.generateMessage(error.type, errors[key].property, error.message)
                messages.push(error)
            }
            result[errors[key].property] = messages
        }
        return result;
    }
    
    async generateMessage(type: string, property: string, defaultMsg: string){
        const translatedProperty = await this.i18n.translate("errors." + property);
        const customVlidators = ['isMatch'];
        const message = customVlidators.includes(type) ? defaultMsg : type;
        const response = await this.i18n.translate("errors." + message, {
            args: {
                property: translatedProperty,
                length: ['minLength', 'maxLength', 'min', 'max', 'numberLength', 'minnNumberLength', 'maxNumberLength'].includes(type) ? defaultMsg.match(/\d+/)[0] : 0,
            }
        })
        return response
    }
    
}