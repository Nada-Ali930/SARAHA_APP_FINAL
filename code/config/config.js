import {resolve} from 'node:path'
import {config} from "dotenv"


export const NODE_ENV = process.env.NODE_ENV
const envPathes = {
    development:".env.development",
    production:".env.production"
}

config({path:resolve(`./config/${envPathes[NODE_ENV]}`)})

export const APPLICATION_NAME =process.env.APPLICATION_NAME
export const DB_URI =process.env.DB_URI
export const REDIS_URI =process.env.REDIS_URI
export const SALT_ROUND =parseInt(process.env.SALT_ROUND??'10')
export const IV_LENGTH =parseInt(process.env.IV_LENGTH??'16')

export const PORT =process.env.PORT
export const USER_ACCESS_TOKEN_SECRET_KEY =process.env.USER_ACCESS_TOKEN_SECRET_KEY
export const USER_REFRESH_TOKEN_SECRET_KEY =process.env.USER_REFRESH_TOKEN_SECRET_KEY
export const SYSTEM_ACCESS_TOKEN_SECRET_KEY =process.env.SYSTEM_ACCESS_TOKEN_SECRET_KEY
export const SYSTEM_REFRESH_TOKEN_SECRET_KEY =process.env.SYSTEM_REFRESH_TOKEN_SECRET_KEY
export const ENC_SECRET_KEY =Buffer.from(process.env.ENC_SECRET_KEY)

export const ACCESS_TOKEN_EXPIRES_IN =parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN)
export const REFRESH_TOKEN_EXPIRES_IN =parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN)

export const EMAIL_APP_PASS =process.env.EMAIL_APP_PASS
export const EMAIL_APP =process.env.EMAIL_APP

export const ORIGINS =process.env.ORIGINS?.split(",") || []

