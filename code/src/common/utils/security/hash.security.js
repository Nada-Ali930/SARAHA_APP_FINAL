import { compare, genSalt, hash } from "bcrypt";
import { SALT_ROUND } from "../../../../config/config.js";
import * as argon2 from 'argon2'
import { HashApproachEnum } from "../../enums/index.js";
export const generateHash = async({plaintext,salt=SALT_ROUND,minor='b',approach=HashApproachEnum.bcrypt}={})=>{
    let hashValue;
    switch (approach) {
        case HashApproachEnum.argon2:
            hashValue =await argon2.hash(plaintext)
            break;
    
        default:
            const generatedSalt = await genSalt(salt,minor)
            hashValue =  await hash(plaintext,generatedSalt)
            break;
    }
    
  return hashValue
}

export const compareHash = async({plaintext,ciphertext,approach=HashApproachEnum.bcrypt}={})=>{
    let match = false;
    switch (approach) {
        case HashApproachEnum.argon2:
            match =await argon2.verify(ciphertext,plaintext)
            break;
    
        default:
            match =  await compare(plaintext,ciphertext)
            break;
    }
    
  return match
}