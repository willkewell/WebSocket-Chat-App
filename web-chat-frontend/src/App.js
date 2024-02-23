import React, { useState, useEffect } from 'react'
import Stomp from 'stompjs'
import SockJS from 'sockjs-client'

const App = () => {
  // STORE DATA WITH USESTATE
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [stompClient, setStompClient] = useState(null);

  // ESTABLISH WEBSOCKET CONNECTION WITH USEEFFECT TO SETUP MESSAGE SUBSCRIBTION
  useEffect(()=>{

    // CREATE NEW SOCKET (SOCKJS INSTANCE) TO ENABLE COMMUNICATION BETWEEN CLIENT/SERVER
    const socket = new SockJS('http://localhost:8080/ws')

    // CREATES STOMP CLIENT OVER SOCKET CONNECTION
    const client = new Stomp.over(socket);

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

  },[]);

  // UPDATE NICKNAME & MESSAGE STATES
  const handleMessageChange = (e) => {
    setMessage (e.target.value);
  }

  const handleNicknameChange = (e) => {
    setNickname (e.target.value);
  }

  const sendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        nickname,
        content: messages
      };

      stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
      sendMessage('');
    }
  }

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <div>{msg.nickname.charAt(0)}</div>
            <h4>{msg.nickname}</h4>
            <small>{msg.content}</small>
          </li>
        ))}
      </ul>
      <div style={{display:'flex', alignItems:'center'}}>
        <div>
          <input type='text' id='nicknameBox' name='nicknameBox' placeholder={nickname} />
          <label for='nickname'>Nickname</label>
        </div>
        <div>
          <input type='text' id='messageBox' name='messageBox' placeholder='' />
          <label for='message'>Message</label>
        </div>
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

export default App