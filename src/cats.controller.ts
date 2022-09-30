import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {CatsService} from "./cats.service";
import { Cat } from './/cat.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";

export const chk_role=(roles:any[],role:any):Boolean=>{
  return roles.includes(role);
  }


export class CreateCatDto {
    name?: string;
    mail: string;
    password?: string;
    role:number;
   
  
  }

  @Controller('cats')
export class CatController {
    constructor(private jwtService: JwtService,
      private readonly catsService: CatsService) {}
     @Post()
async create(@Body() createCatDto: CreateCatDto) {
  const saltOrRounds = 10;
  const hash = await bcrypt.hash(createCatDto.password, saltOrRounds);

  createCatDto.password=hash;
   return this.catsService.createCat(createCatDto)

}
 
@Post('signin')
async createe(@Body() createCatDto: CreateCatDto) {
  
  
   const u= await this.catsService.findOne(createCatDto) as any;
   if(u){
    const jwt=await this.jwtService.signAsync({id:u.mail,role:u?.role});
    const result=bcrypt.compareSync(createCatDto?.password,u.password)
    return result?{...u?._doc,token:jwt}:{message:"Invalid Password!"}
   }
   else{
   return  {
    message:"Mail Not Found",
   };
  }
  
}

@Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
  /* @Get(':id')
  
  async findOne(@Param('id') id: string): Promise<Cat> {
    
    const u= this.catsService.findOne({id});
    bcrypt.compare(CreateCatDto.password, (await u).password).then(function(result) {
       return "true"
  }); */

    
   
/* }
@Delete(':id')
  async delete(@Param('id') id: string) {
    return this.catsService.delete(id);
  } */
   @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  async findOne(@Req()req:any){
    console.log(req.user)
    if(!chk_role([1],req.user.role)){return "Unauthorized"}
    
    // if(chk_role([1],req.user.role)){return req.user.mail}
    // else{
    //   return "unknown"
    // }
    console.log(req.user)
     return req.user.id;
  }

}