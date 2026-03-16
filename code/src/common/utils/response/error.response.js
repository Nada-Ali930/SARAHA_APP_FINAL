import multer from "multer";
import { NODE_ENV } from "../../../../config/config.js";


export const globalErrorHandling = (error, req, res, next) => {
  let status = error.cause?.status ?? 500;
  const mood = NODE_ENV == "production";
  const defaultErrorMessage = "somesing went wrong server error";
  const displayErrorMessage = error.message || defaultErrorMessage;
  if(error instanceof multer.MulterError){
    status = 400
  }
  return res.status(status).json({
    status,
    error_message : mood ? status == 500 ? defaultErrorMessage : displayErrorMessage : defaultErrorMessage,
    extra:error?.cause?.extra||undefined,
    stack :mood ? undefined : error.stack
  });
};

export const ErrorException = ({message="Fail",status=400,extra=undefined}={})=>{
    throw new Error(message,{cause:{status,extra}})
}

//error tampletes
export const BadRequestException = ({message="BadRequestException",extra=undefined}={})=>{
    return ErrorException({message,status:400,extra})
}
export const ConflictException = ({message="conflict",extra=undefined}={})=>{
    return ErrorException({message,status:409,extra})
}
export const NotFoundException = ({message="NotFound",extra=undefined}={})=>{
    return ErrorException({message,status:404,extra})
}
export const UnauthorizedException = ({message="UnauthorizedException",extra=undefined}={})=>{
    return ErrorException({message,status:401,extra})
}
export const ForbiddenException = ({message="ForbiddenException",extra=undefined}={})=>{
    return ErrorException({message,status:403,extra})
}






