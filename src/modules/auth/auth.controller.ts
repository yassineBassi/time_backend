import { Body, Controller, Post } from '@nestjs/common';
import { Response } from 'src/common/response';
import { AuthService } from './auth.service';
import { RegisterClientDTO } from './dtos/register-client.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register/client")
  async registerAccount(@Body() request: RegisterClientDTO) {
    console.log(request);
    return Response.success(await this.authService.registerClient(request), "");
  }

}
