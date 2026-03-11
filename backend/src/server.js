require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const morgan = require('morgan')
const connectDB = require('./config/db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' } })

// DB
connectDB()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Pass io to routes via req
app.use((req, _res, next) => { req.io = io; next() })

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/stores',   require('./routes/stores'))
app.use('/api/orders',   require('./routes/orders'))
app.use('/api/wishlist', require('./routes/wishlist'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/reviews',  require('./routes/reviews'))
app.use('/api/admin',    require('./routes/admin'))

// Socket.IO
io.on('connection', (socket) => {
  socket.on('joinOrderRoom', (orderId) => socket.join('order:' + orderId))
  socket.on('disconnect', () => {})
})

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Clozet API running on port ${PORT}`))
