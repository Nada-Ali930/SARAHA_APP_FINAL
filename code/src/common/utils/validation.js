import joi from "joi"
import { Types } from "mongoose";

export const generalValidationFields = {  // no required
    email: joi.string().email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:["com","net"]}}),
    password:joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/)),
 
    fullName: joi.string().pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)).messages({
        "any.required":"fullName is required",
        "string.empty":"fullName cannot be empty"
    }),
    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
    confirmPassword:function(pass="password"){
        return joi.string().valid(joi.ref(pass))
    },
    phone:joi.string().pattern(new RegExp(/^(00201|\+201|01)[0-25]\d{8}$/)),
    id:joi.string().custom((value,helper)=>{
        return Types.ObjectId.isValid(value) ? true :helper.message("Invalid objectId")
    }),
    file:function(validation = []){
        return joi.object().keys({
            "fieldname": joi.string().required(),
            "originalname":joi.string().required(),
            "encoding":joi.string().required(),
            "mimetype": joi.string().valid(...Object.values(validation)).required(), //fileFieldValidation.image
            "finalPath": joi.string().required(),
            "destination": joi.string().required(),
            "filename": joi.string().required(),
            "path": joi.string().required(),
            "size": joi.number().required()
        })
    }

}




