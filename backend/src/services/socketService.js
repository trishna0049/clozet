const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Customer joins order room for live tracking
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined order_${orderId}`);
    });

    // Delivery partner joins their room
    socket.on('join_delivery', (partnerId) => {
      socket.join(`delivery_${partnerId}`);
    });

    // Delivery partner sends location
    socket.on('update_location', ({ orderId, lat, lng }) => {
      io.to(`order_${orderId}`).emit('location_update', { lat, lng, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
