import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, prisma } from './config/database.js';

const app = createApp();

function startServer(port: number) {
  const server = app.listen(port, async () => {
    console.log(`🚀 CanteenX Backend Server running on http://localhost:${port}`);
    console.log(`📊 Health Check available at http://localhost:${port}/api/health`);
    console.log(`🏛️ Colleges API available at http://localhost:${port}/api/colleges`);

    // Attempt database connection
    await connectDatabase();
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is currently in use (e.g. by macOS AirPlay Receiver).`);
      console.warn(`👉 To free port 5000 on macOS: Disable "AirPlay Receiver" in System Settings > General > AirDrop & AirPlay, or set PORT in server/.env.`);
    } else {
      console.error('Server error:', err);
    }
  });

  // Graceful shutdown handling
  const handleShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down CanteenX server gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed.');
      } catch (e) {
        console.error('Error disconnecting database:', e);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  return server;
}

startServer(config.port);

