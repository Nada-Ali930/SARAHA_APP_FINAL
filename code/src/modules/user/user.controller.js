import {Router} from 'express'
import { logout, profile, profileCoverImage, profileImage, removeProfileImage, rotateToken, shareProfile, updatePassword } from './user.service.js'
import { successResponse } from '../../common/utils/index.js'
import { RoleEnum, tokenTypeEnum } from '../../common/enums/index.js'
import { authentication , authorization, validation } from '../../middleware/index.js'
import {endpoint} from './user.authorization.js'
import * as validators from './user.validation.js'
import { fileFieldValidation ,localFileUpload} from '../../common/utils/multer/index.js'
import { userModel } from '../../DB/index.js'

const router = Router() // = app


export const incrementProfileVisit = async (req, res, next) => {
    try {
        req.user.visitCount = (req.user.visitCount || 0) + 1;
        await req.user.save();
        next();
    } catch (err) {
        next(err);
    }
};

router.post("/logout",authentication(),async(req,res,next)=>{
    const status = await logout(req.body,req.user,req.decodedToken)
    return successResponse({res,status})
})

router.patch("/password",
    authentication(),
    validation(validators.userPassword)
    ,async(req,res,next)=>{
        const credentials = await updatePassword(req.body,req.user,`${req.protocol}//${req.host}`)
        return successResponse({res,data:{...credentials}})
    }
)

router.patch("/profile-image",
    authentication(),
    localFileUpload({
        customPath : "users/profile",
        validation:fileFieldValidation.image,  //[...fileFieldValidation.image,fileFieldValidation.video[0]]
        maxSize:7
    }).single("attachment"),validation(validators.profileImage),async(req,res,next)=>{
    const account = await profileImage(req.file,req.user)
    return successResponse({res,data:{account}})//file:req.file
})

// router.patch("/profile-cover-image",
//     authentication(),
//     localFileUpload({
//         customPath : "users/profile/cover",
//         validation:fileFieldValidation.image,
//         maxSize:5
//     }).array("attachments",5),validation(validators.profileCoverImage),async(req,res,next)=>{  //limit 3 images
//     // const account = await profileCoverImage(req.files,req.user)
//     return successResponse({res,data:{files:req.files}})    //files:req.files
// })

router.patch("/profile-cover-image",
authentication(),
localFileUpload({
    customPath : "users/profile/cover",
    validation:fileFieldValidation.image,
    maxSize:5
}).array("attachments",2),
validation(validators.profileCoverImage),

async(req,res,next)=>{
    const account = await profileCoverImage(req.files,req.user)

    return successResponse({
        res,
        data:{account}
    })
})

// router.get('/',
//     authentication(),
//     authorization(endpoint.profile)    //[RoleEnum.Admin,RoleEnum.User] 
//     ,async(req,res,next)=>{
//     const account = await profile(req.user) 
//     return successResponse({res,data:{account}})
// })

router.get('/',
    authentication(),
    authorization(endpoint.profile),
    incrementProfileVisit,  
    async(req, res, next) => {
        const account = await profile(req.user);
        return successResponse({res, data: {account}});
    }
);

router.get('/admin/total-profile-visits',
    authentication(),
    authorization([RoleEnum.Admin]),
    async (req, res, next) => {
        try {
            const totalVisits = await userModel.aggregate([
                { $group: { _id: null, total: { $sum: "$visitCount" } } }
            ]);
            return successResponse({res, data: {totalVisits: totalVisits[0]?.total || 0}});
        } catch (err) {
            next(err);
        }
    }
);

router.get('/:userId/shared-profile',
    validation(validators.shareProfile)
    ,async(req,res,next)=>{
    const account = await shareProfile(req.params.userId) 
    return successResponse({res,data:{account}})
})

router.post('/rotate-token',
    authentication(tokenTypeEnum.Refresh)
    ,async(req,res,next)=>{
    const credentials = await rotateToken(req.user,req.decodedToken,`${req.protocol}//${req.host}`)   
    return successResponse({res,status:201,data:{...credentials}})
})

router.delete("/profile-image",
    authentication(),

    async (req,res,next)=>{

        const account = await removeProfileImage(req.user)

        return successResponse({
            res,
            data:{account}
        })
    }
)


export default router


