#!/bin/bash

echo "🚀 Starting FIX-ISH AI Guide"
echo "============================"
echo ""

# Check if backend is running
if curl -s http://localhost:5050/health > /dev/null 2>&1; then
    echo "✅ Backend is already running on port 5050"
else
    echo "⚠️  Backend not running. Starting backend..."
    cd /workspaces/FIX-ISH/backend
    nohup python main.py > /tmp/backend_fixish.log 2>&1 &
    echo "Backend PID: $!"
    sleep 3
    
    if curl -s http://localhost:5050/health > /dev/null 2>&1; then
        echo "✅ Backend started successfully"
    else
        echo "❌ Backend failed to start. Check logs: tail -f /tmp/backend_fixish.log"
        exit 1
    fi
fi

echo ""
echo "🎨 Starting frontend..."
cd /workspaces/fixish-ai-guide

# Kill any existing frontend on port 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null

npm run dev > /tmp/frontend_fixish.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 5

echo ""
echo "✅ FIX-ISH AI Guide is running!"
echo "============================"
echo ""
echo "📍 URLs:"
echo "  Frontend: http://localhost:8081"
echo "  Backend:  http://localhost:5050"
echo ""
echo "🎯 Test Pages:"
echo "  Landing:  http://localhost:8081/"
echo "  Chat:     http://localhost:8081/chat"
echo "  Backend:  http://localhost:8081/backend-features ⭐ NEW"
echo "  Live:     http://localhost:8081/live-repair"
echo ""
echo "📋 Logs:"
echo "  Backend:  tail -f /tmp/backend_fixish.log"
echo "  Frontend: tail -f /tmp/frontend_fixish.log"
echo ""
echo "🛑 To stop:"
echo "  kill $FRONTEND_PID"
echo ""
echo "🎉 Open http://localhost:8081/backend-features to test!"
