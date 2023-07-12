import Peer from 'simple-peer';
import { useEffect, useState } from 'react';
import { Replayer } from 'rrweb';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io('https://signalling-server-1a58ba404ba9.herokuapp.com/');

const roomName = 'testing';

const Live = () => {
  const [peer, setPeer] = useState(undefined);

  function createPeer(data) {
    const peer = new Peer({ initiator: false, trickle: false });
    console.warn('new peer created');
    setPeer(peer);
    peer.on('signal', (signal) => {
      console.warn('sending "answer"', signal);
      socket.emit('returning signal', {
        signal,
        room: roomName,
      });
    });
    peer.signal(JSON.stringify(data));
  }

  useEffect(() => {
    const replayer = new Replayer([], {
      liveMode: true,
    });
    replayer.startLive();

    socket.on('connect', () => {
      console.warn('Sockets Initiating');
      socket.emit('join room', roomName);
    });

    socket.on('received signal', (data) => {
      console.warn('*Peer Offer Incoming*');
      createPeer(data);
    });

    if (peer) {
      peer.on('data', (data) => {
        replayer.addEvent(JSON.parse(data));
      });

      peer.on('error', (error) => {
        console.warn('ERROR CAME ****************', error);
        peer.destroy();
        peer.removeAllListeners('signal');
        socket.removeListener('received signal');
        replayer.destroy();
        setPeer(undefined);
      });
    }
  }, [peer]);

  // useEffect(() => {
  //   const peer = new Peer({ initiator: false, trickle: false });
  //   console.warn('peer', peer);

  //   const replayer = new Replayer([], {
  //     liveMode: true,
  //   });
  //   replayer.startLive();

  //   console.warn('replayer', replayer);

  //   replayer.startLive();

  //   // Set up a listener for real-time updates

  //   db.collection('signal').onSnapshot((snapshot) => {
  //     const data = snapshot.docChanges()[snapshot.docChanges().length - 1];
  //     console.warn('data', data.doc.data());
  //     peer.on('signal', (signal) => {
  //       console.warn('returning signal');
  //       returnSignal(signal);
  //     });
  //     peer.signal(JSON.stringify(data.doc.data().signal));
  //   });

  //   peer.on('data', (data) => {
  //     replayer.addEvent(JSON.parse(data));
  //   });
  // }, []);

  // // Return signal to the Initializing peer
  // function returnSignal(signal) {
  //   console.warn('signal', signal);
  //   db.collection('returningSignal')
  //     .add({ signal })
  //     .then((docRef) => {
  //       console.log('Message added with ID:', docRef.id);
  //     })
  //     .catch((error) => {
  //       console.error('Error adding message:', error);
  //     });
  // }

  return <h1>Live Sharing</h1>;
};

export default Live;
