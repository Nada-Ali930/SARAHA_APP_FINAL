import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../../config/config.js"
import { LogoutEnum, tokenTypeEnum } from "../../common/enums/security.enum.js"
import { baseRevokeTokenKey, deletekeys, keys, revokeTokenKey, set } from "../../common/services/index.js"
import { compareHash, ConflictException, createLoginCredentials, decodeToken, generateDecryption, generateEncryption, generateHash, NotFoundException } from "../../common/utils/index.js"
import { createOne, deleteMany, findOne } from "../../DB/database.repository.js"
import { tokenModel, userModel } from "../../DB/index.js"
import { existsSync, unlinkSync } from "fs";
import { join } from "path";


const createRevokeToken = async({userId,jti,ttl})=>{
    await set({
        key:revokeTokenKey({userId,jti}),
        value:jti,
        ttl
    })
    return ;
}
export const logout =async({flag},user,{jti,iat,sub})=>{
    let status = 200
    switch (flag) {
        case LogoutEnum.All:
            user.changeCredentialsTime = new Date()
            await user.save()
            await deletekeys(await keys(baseRevokeTokenKey(sub)))
            break;    
        default:
            // await set({
            //     key:revokeTokenKey({userId:sub,jti}),
            //     value:jti,
            //     ttl:iat+REFRESH_TOKEN_EXPIRES_IN  //s
            // })
            await createRevokeToken({
              userId:sub,
              jti,
              ttl:iat+REFRESH_TOKEN_EXPIRES_IN
            })
            status = 201
            break;
    }
    
    return status
}

export const updatePassword =async({oldPassword,password},user,issuer)=>{
    if(!await compareHash({plaintext:oldPassword,ciphertext:user.password})){
        throw ConflictException({message:"invalid old password"})
    }
    for (const hash of user.oldPassword || []) {
        if(await compareHash({plaintext:password,ciphertext:hash})){
          throw ConflictException({message:"this password is already used before"})
        }
    }
    user.oldPassword.push(user.password)
    user.password = await generateHash({plaintext:password})
    user.changeCredentialsTime = new Date(),
    await user.save()
    await deletekeys(await keys(baseRevokeTokenKey(user._id)))
    return await createLoginCredentials(user,issuer);  //login
}

// export const profileImage =async(file,user)=>{
//     user.profilePicture = file.finalPath
//     await user.save()
//     return user
// }

export const profileImage = async (file, user) => {

    if (!file) {
        throw new Error("Profile image is required")
    }

    if (user.profilePicture) {
        user.gallery.push(user.profilePicture)
    }

    user.profilePicture = file.finalPath

    await user.save()

    return user
}


// export const profileCoverImage =async(files,user)=>{
//     user.coverProfilePictures = files.map(file=>file.finalPath)
//     await user.save()
//     return user
// }

export const profileCoverImage = async (files, user) => {

    const oldImages = user.coverProfilePictures?.length || 0
    const newImages = files.length

    if (oldImages + newImages > 2) {
        throw new Error("Total cover images can't exceed 2")
    }

    const imagesPath = files.map(file => file.finalPath)

    user.coverProfilePictures.push(...imagesPath)

    await user.save()

    return user
}

export const profile =async(user)=>{
     return user
}

export const shareProfile =async(userId)=>{
    const account = await findOne({
        model:userModel,
        filter:{_id:userId},
        select:"-password"
    })
    if(!account){
        throw NotFoundException({message:"Invaid Shared Account"})
    }
    if(account.phone){
        account.phone = await  generateDecryption(account.phone)
    }
    return account
}


export const rotateToken =async(user,{jti,iat,sub},issuer)=>{
    if((iat+ACCESS_TOKEN_EXPIRES_IN)*1000>=Date.now()+(30000)){  //5*60*1000 after five seconds
        throw ConflictException({message:"Current access Token Still valid"})
    }
    // await set({
    //     key:revokeTokenKey({userId:sub,jti}),
    //     value:jti,
    //     ttl:iat+REFRESH_TOKEN_EXPIRES_IN  //s
    // })
     await createRevokeToken({
        userId:sub,
        jti,
        ttl:iat+REFRESH_TOKEN_EXPIRES_IN
     })
    return createLoginCredentials(user,issuer)
}


export const removeProfileImage = async (user) => {

    if (!user.profilePicture) {
        throw new Error("No profile image found");
    }

    const fileName = user.profilePicture.split("/").pop();

    const absolutePath = join(process.cwd(), "..", "uploads/users/profile", fileName);

    console.log("Trying to delete:", absolutePath);

    if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
        console.log("Deleted successfully ✅");
    } else {
        console.warn("File not found ❌");
    }

    user.profilePicture = null;
    await user.save();

    return user;
};