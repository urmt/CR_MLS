import dotenv from 'dotenv'

dotenv.config()


export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cr_mls',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox'
  },
  registroNacionalApiKey: process.env.REGISTRO_NACIONAL_API_KEY,
  minaeApiKey: process.env.MINAE_API_KEY,
  municipalApiToken: process.env.MUNICIPAL_API_TOKEN
}
