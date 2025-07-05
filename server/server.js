const app = require('./app');
const { setupDatabase, closeConnection } = require('./database');

const PORT = process.env.PORT || 5000;
let server;

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      try {
        await closeConnection();
        console.log('Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

  
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  console.error('Promise:', promise);
  
  if (server) {
    server.close(async () => {
      try {
        await closeConnection();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  
  if (server) {
    server.close(async () => {
      try {
        await closeConnection();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

const startServer = async () => {
  try {
    console.log('🔄 Starting PrepFire API Server...');
    
    // Setup database connection and indexes
    await setupDatabase();
    console.log('✅ Database setup completed');
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`
🚀 PrepFire API Server Running
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: Connected
⚡ Ready to handle requests!
      `);
    });

    // Set server timeout
    server.setTimeout(30000);

    // Make server available globally if needed
    global.server = server;

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    
    // Try to close database connection if it was opened
    try {
      await closeConnection();
    } catch (dbError) {
      console.error('Error closing database connection during startup failure:', dbError);
    }
    
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;