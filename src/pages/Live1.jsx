import { useEffect, useRef } from 'react';
import { Replayer, unpack } from 'rrweb';
import { connect, io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const roomName = 'testing';
const socket = io('https://signalling-server-1a58ba404ba9.herokuapp.com/');

const Live = () => {
  const timeoutId = useRef(null);

  useEffect(() => {
    const replayer = new Replayer([], {
      liveMode: true,
    });
    replayer.startLive();

    const connection = new RTCPeerConnection();
    socket.on('connect', () => {
      console.warn('Sockets Initiating');
      socket.emit('join room', roomName);
    });

    socket.on('send offer', (offer) => {
      console.warn('OFFER COMING', offer);
      connection.setRemoteDescription(JSON.parse(offer));
      connection.ondatachannel = ({ channel }) => {
        channel.onmessage = (event) => {
          //   console.warn('event', JSON.parse(event.data));
          console.warn('event', event);
          const unpackedData = unpack(event.data);
          console.warn('unpackedData', unpackedData);
          replayer.addEvent(unpackedData.events);
        };
      };
      connection.createAnswer().then((answer) => {
        connection.setLocalDescription(answer);
        connection.onicecandidate = () => handleIceCandidate();
      });
    });

    const handleIceCandidate = () => {
      console.warn('connection.localDescription', connection.localDescription);

      if (timeoutId.current) clearTimeout(timeoutId.current);
      timeoutId.current = setTimeout(() => {
        socket.emit('send answer', {
          answer: JSON.stringify(connection.localDescription),
          room: roomName,
        });
      }, 2000);
    };

    return () => socket.disconnect();
  }, []);

  return <h1>Live Sharing</h1>;
};

export default Live;
