import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url, userId) => {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState(null);
  const socketRef = useRef(null);
  const reconectTimeoutRef = useRef(null);
  
  // 重连逻辑
  const reconnect = useCallback(() => {
    if (reconectTimeoutRef.current) {
      clearTimeout(reconectTimeoutRef.current);
    }
    
    reconectTimeoutRef.current = setTimeout(() => {
      console.log('尝试重新连接WebSocket...');
      connect();
    }, 5000); // 5秒后重连
  }, []);
  
  // 建立连接
  const connect = useCallback(() => {
    if (typeof window === 'undefined' || !userId) return;
    
    try {
      // 如果浏览器不支持WebSocket，回退到轮询
      if (!('WebSocket' in window)) {
        console.log('浏览器不支持WebSocket，使用轮询');
        setConnected(false);
        return;
      }
      
      // 关闭现有连接
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      // 创建新连接
      const socket = new WebSocket(`${url}?userId=${userId}`);
      
      socket.onopen = () => {
        console.log('WebSocket连接已建立');
        setConnected(true);
        
        // 发送ping以保持连接
        const pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
        
        socketRef.current.pingInterval = pingInterval;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessage(data);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason);
        setConnected(false);
        clearInterval(socketRef.current?.pingInterval);
        
        // 自动重连
        if (!event.wasClean) {
          reconnect();
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        socket.close();
      };
      
      socketRef.current = socket;
    } catch (error) {
      console.error('初始化WebSocket失败:', error);
      setConnected(false);
    }
  }, [url, userId, reconnect]);
  
  // 发送消息
  const sendMessage = useCallback((data) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }
    
    try {
      socketRef.current.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('发送WebSocket消息失败:', error);
      return false;
    }
  }, []);
  
  // 连接和断开
  useEffect(() => {
    if (userId) {
      connect();
    }
    
    return () => {
      if (socketRef.current) {
        clearInterval(socketRef.current.pingInterval);
        socketRef.current.close();
      }
      
      if (reconectTimeoutRef.current) {
        clearTimeout(reconectTimeoutRef.current);
      }
    };
  }, [userId, connect]);
  
  return { connected, message, sendMessage };
};

export default useWebSocket;
