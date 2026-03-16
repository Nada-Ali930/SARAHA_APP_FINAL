import joi from "joi"
import { generalValidationFields } from "../../common/utils/index.js"
export const loginSchema = {
  body:joi
  .object()
  .keys({
    email: generalValidationFields.email.required(),
    password:generalValidationFields.password.required(),
  })
  .required()

}

export const signupSchema ={
  body:loginSchema.body.append()
  .keys({
    fullName:generalValidationFields.fullName.required(),
    confirmPassword:generalValidationFields.confirmPassword("password").required(),
    phone:generalValidationFields.phone.required(),
  }).required(),

  
}

export const resendConfirmEmailSchema ={
  body:joi.object()
  .keys({
    email:generalValidationFields.email.required(),
  }).required(),

}


export const confirmEmailSchema ={
  body:resendConfirmEmailSchema.body
  .append({
    otp:generalValidationFields.otp.required(),
  }).required(),

}

export const resetForgotPasswordSchema ={
  body:confirmEmailSchema.body
  .append({
    password:generalValidationFields.password.required(),
    confirmPassword:generalValidationFields.confirmPassword("password").required()
  }).required(),

}



















