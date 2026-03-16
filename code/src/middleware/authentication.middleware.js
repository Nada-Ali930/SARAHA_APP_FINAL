import { tokenTypeEnum } from "../common/enums/index.js";
import { decodeToken } from "../common/utils/index.js";
import {login} from "../modules/auth/auth.service.js";
import {BadRequestException,ForbiddenException,UnauthorizedException} from "../common/utils/response/index.js"
export const authentication = (tokenType=tokenTypeEnum.Access)=>{
    return async(req,res,next)=>{
       const[schema , credentials] = req.headers.authorization?.split(" ") || [] // Bearer token  
       console.log({authorization,schema,credentials});
       if(!schema||!credentials){
        throw UnauthorizedException({message:"missing authentication key or Invalid approach"})
       }
       switch (schema) {
        case "Basic": //url encoding
            const [email,password] = Buffer.from(credentials,'base64').toString().split(":")||[]
            await login({email,password},`${req.protocol}://${req.host}`)
            break;
        case "Bearer":   
            // req.user = await decodeToken({token:credentials,tokenType})
            const {user,decodedToken} = await decodeToken({token:credentials,tokenType})
            req.user=user
            req.decodedToken=decodedToken
            break;
        default:
            throw BadRequestException({message:"missing authentication schema"})
            break;
       }
       
       next()
    }
}

export const authorization = (accessRules=[])=>{
    return async(req,res,next)=>{
    if(!accessRules.includes(req.user.role)){
       throw ForbiddenException({message:"Not authorized account"})
    }
    next()
    }
}







// export const authentication = (tokenType=tokenTypeEnum.Access)=>{
//     return async(req,res,next)=>{
//        req.user = await decodeToken({token:req.headers.authorization,tokenType})
//        next()
//     }
// }