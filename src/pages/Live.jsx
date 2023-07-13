import Peer from 'simple-peer';
import { useEffect, useRef, useState } from 'react';
import { Replayer, unpack } from 'rrweb';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io('https://signalling-server-1a58ba404ba9.herokuapp.com/');

const roomName = 'testing';

const Live = () => {
  const [peer, setPeer] = useState(undefined);
  const [replayerS, setReplayerS] = useState(null);

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

    const replayer = new Replayer([], {
      liveMode: true,
      unpackFn: unpack,
    });
    replayer.startLive();

    setReplayerS(replayer);
  }, []);

  useEffect(() => {
    console.warn('****************** COMPONENT RENDER ************');
    if (peer && replayerS) {
      console.warn('peer', peer._id);
      peer.on('data', (data) => {
        replayerS.addEvent(JSON.parse(data));
      });

      peer.on('error', (error) => {
        console.warn('ERROR CAME ****************', error);
        peer.destroy();
        peer.removeAllListeners('signal');
        // socket.removeListener('received signal');
        // replayer.destroy();
        setPeer(undefined);
      });
    }
  }, [peer, replayerS]);

  return <h1>Live Sharing</h1>;
};

export default Live;
