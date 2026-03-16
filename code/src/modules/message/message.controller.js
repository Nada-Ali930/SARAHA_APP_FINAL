import { Router } from "express";
import { BadRequestException, decodeToken, fileFieldValidation, localFileUpload, successResponse } from "../../common/utils/index.js";
import { deleteMessage, getMessage, getMessages, sendMessage } from "./message.service.js";
import { authentication, validation } from "../../middleware/index.js";
import * as validators from './message.validation.js'
import { tokenTypeEnum } from "../../common/enums/security.enum.js";
const router = Router({caseSensitive:true,strict:true,mergeParams:true});

router.post("/:receiverId",
    async(req,res,next)=>{
        if(req.headers.authorization){
            const {user,decodedToken} = await decodeToken({token:req.headers.authorization.split(" ")[1],tokenType:tokenTypeEnum.Access})
            req.user=user
            req.decodedToken=decodedToken
        }
        next()
    },
    localFileUpload({validation:fileFieldValidation.image,customPath:"Messages",maxSize:1}).array("attachments",2),
    validation(validators.sendMessageSchema),
    async(req,res,next)=>{
    if(!req.body?.content && !req.files?.length){
        throw BadRequestException({
          message: "validation error",
          extra: { key: "body", path: ["content"], message: "missing content" },
        });
    }
    const message = await sendMessage(req.params.receiverId, req.body ,req.files,req.user);
    return successResponse({ res, status: 201, data: { message } });
})


router.get("/list",
    authentication(),
    async(req,res,next)=>{

    const messages = await getMessages(req.user);
    return successResponse({ res, data: { messages } });
})


router.get("/:messageId",
    authentication(),
    validation(validators.getMessageSchema),
    async(req,res,next)=>{

    const message = await getMessage(req.params.messageId,req.user);
    return successResponse({ res, data: { message } });
})


router.delete("/:messageId",
    authentication(),
    validation(validators.getMessageSchema),
    async(req,res,next)=>{

    const message = await deleteMessage(req.params.messageId,req.user);
    return successResponse({ res, data: { message } });
})


export default router