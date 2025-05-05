import uvicorn
import multiprocessing

if __name__ == "__main__":
    # Set number of workers to 1 to avoid multiple model initializations
    workers = 1
    
    # Configure uvicorn server
    config = uvicorn.Config(
        "main:app",
        host="127.0.0.1",
        port=5000,
        reload=False,  # Disable reload to prevent model reinitialization
        workers=workers,
        log_level="info",
        timeout_keep_alive=120,  # Increase keep-alive timeout
        limit_concurrency=100,   # Limit concurrent connections
        backlog=2048            # Increase connection backlog
    )
    
    # Start server
    server = uvicorn.Server(config)
    server.run() 