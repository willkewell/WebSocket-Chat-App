import React, { useState, useEffect } from 'react'
import Stomp from 'stompjs'
import SockJS from 'sockjs-client'
import './App.css'

const App = () => {
  // STORE DATA WITH USESTATE
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [stompClient, setStompClient] = useState(null);

  // ESTABLISH WEBSOCKET CONNECTION WITH USEEFFECT TO SETUP MESSAGE SUBSCRIBTION
  useEffect(()=>{

    // CREATE NEW SOCKET (SOCKJS INSTANCE) TO ENABLE COMMUNICATION BETWEEN CLIENT/SERVER
    const socket = new SockJS('http://localhost:8080/ws');

    // CREATES STOMP CLIENT OVER SOCKET CONNECTION
    const client = Stomp.over(socket);

    // ESTABLISH CONNECTION TO SERVER
    client.connect({}, () => {
      // SUBSCRIBES TO TOPIC/MESSAGES ON SERVER TO RECIEVE MESSAGES PUBLISHED TO THIS TOPIC
      client.subscribe('/topic/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });

    setStompClient(client);

    return () => {
      client.disconnect();
    };

  }, []);

  // UPDATE NICKNAME & MESSAGE STATES
  const handleMessageChange = (event) => {
    setMessage (event.target.value);
  }

  const handleNicknameChange = (event) => {
    setNickname (event.target.value);
  }

  const sendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        nickname,
        content: message,
        timestamp: new Date(),
      };

      stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
      setMessage('');
    }
  }

  return (
    <div>
      <div className='chat__banner' >
        <h1>WEBSOCKET CHAT APP</h1>
        <h3>Get Chatting!</h3>
      </div>
      <div className='container app__container'>
      <div>
        <ul className='chat__area'>
          {messages.map((msg, index) => (
            (nickname == msg.nickname) ? (
              <li className='chat__message chat__message__user' key={index}>
                <div className='chat__message-avatar'>{msg.nickname.charAt(0).toUpperCase()}</div>
                <h4 className='chat__message-nickname'>{msg.nickname}</h4>
                <p className='chat__message-content'>{msg.content}</p>
                <small className='chat__message-timestamp'>{msg.timestamp}</small>
              </li>
            ) : (
              <li className='chat__message chat__message__other' key={index}>
                <div className='chat__message-avatar'>{msg.nickname.charAt(0).toUpperCase()}</div>
                <h4 className='chat__message-nickname'>{msg.nickname}</h4>
                <p className='chat__message-content'>{msg.content}</p>
                <small className='chat__message-timestamp'>{msg.timestamp}</small>
              </li>
            ) 
          ))}
        </ul>
      </div>
      
      <div className='chat__input'>
        <div className='chat__input-nickname'>
          <input value={nickname} onChange={handleNicknameChange} />
          <label>Nickname</label>
        </div>
        <div className='chat__input-message'>
          <textarea value={message} onChange={handleMessageChange}/>
          <label>Message</label>
        </div>
        <button onClick={sendMessage} disabled={!message.trim()}>Send</button>
      </div>
    </div>
    </div>
    
  )
}

export default App