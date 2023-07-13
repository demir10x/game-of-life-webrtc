import Peer from 'simple-peer';
import { useEffect, useState } from 'react';
import { Replayer, unpack } from 'rrweb';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io('https://signalling-server-1a58ba404ba9.herokuapp.com/');

const roomName = 'testing';

const Live = () => {
  const [peer, setPeer] = useState(undefined);

  function createPeer(data) {
    const peer = new Peer({ initiator: false, trickle: false });
    setPeer(peer);
    peer.on('signal', (signal) => {
      console.warn('sending "answer"', peer._id);
      socket.emit('returning signal', {
        signal,
        room: roomName,
      });
    });
    console.warn('peer', peer._id);
    setTimeout(() => {
      peer.signal(JSON.stringify(data));
    }, 1000);
  }

  useEffect(() => {
    socket.on('connect', () => {
      console.warn('Sockets Initiating');
      socket.emit('join room', roomName);
    });

    socket.on('received signal', (data) => {
      console.warn('*Peer Offer Incoming*');
      createPeer(data);
    });
  }, []);

  useEffect(() => {
    const replayer = new Replayer([], {
      liveMode: true,
      unpackFn: unpack,
    });
    replayer.startLive();

    if (peer) {
      console.warn('peer', peer._id);
      peer.on('data', (data) => {
        replayer.addEvent(JSON.parse(data));
      });

      peer.on('error', (error) => {
        console.warn('ERROR CAME ****************', error);
        peer.destroy();
        peer.removeAllListeners('signal');
        // socket.removeListener('received signal');
        replayer.destroy();
        setPeer(undefined);
      });
    }
  }, [peer]);

  return <h1>Live Sharing</h1>;
};

export default Live;
