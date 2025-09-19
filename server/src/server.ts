import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from './routes/authRoutes'
import propertyRouter from './routes/propertyRoutes'
import paymentRouter from './routes/paymentRoutes'
import dashboardRouter from './routes/dashboardRoutes'
import { errorHandler } from './middleware/errorHandler'
import { config } from './config'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/properties', propertyRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/dashboard', dashboardRouter)

// Error handling
app.use(errorHandler)

// Database connection
mongoose.connect(config.mongodbUri)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })
