import {randomUUID} from "node:crypto"
import multer from "multer";
import { resolve } from "node:path";
import { existsSync, mkdir, mkdirSync } from "node:fs";
import {fileFilter} from  "./validation.multer.js"
export const localFileUpload =({
    customPath = "general"      //named params
    ,validation = [],
    maxSize = 5
}={})=>{
    const storage = multer.diskStorage({   //خزنت الملف على hard disk
        destination:function(req,file,cb){
            const fullPath = resolve(`../uploads/${customPath}`)
            if(!existsSync(fullPath)){
                mkdirSync(fullPath,{recursive:true})
            }
            cb(null,fullPath)
        },  
        filename:function(req,file,cb){
            const uniqueFileName = randomUUID()+"_"+file.originalname  // originalname => name + extention
            file.finalPath = `uploads/${customPath}/${uniqueFileName}`
            cb(null,uniqueFileName)  
        }
    })
    return multer({fileFilter:fileFilter(validation),storage,limits:{fileSize:maxSize*1024*1024}})  // return multer instance
    
}









