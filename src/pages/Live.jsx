import Peer from 'simple-peer';
import { useEffect } from 'react';
import { Replayer } from 'rrweb';
import { io } from 'socket.io-client';

const Live = () => {
  //   useEffect(() => {
  //     var socket = io('http://localhost:3000');
  //     var roomName = 'SqFR5uoLEUX8Qzuo66xF686qxf23';

  //     const replayer = new Replayer([], {
  //       liveMode: true,
  //     });
  //     replayer.startLive();

  //     socket.on('connect', () => {
  //       socket.emit('new-user', roomName);

  //       // received from user side
  //       socket.on('user-event', (data) => {
  //         console.log('data', data);
  //         replayer.addEvent(data);
  //       });
  //     });
  //   }, []);

  useEffect(() => {
    const socket = io(
      'https://signaling-server-bm-7010f2e071ee.herokuapp.com/'
    );
    const roomName = 'testing';

    const peer = new Peer({ initiator: false, trickle: false });
    const replayer = new Replayer([], {
      liveMode: true,
    });
    replayer.startLive();

    socket.on('connect', () => {
      // Join socket room
      socket.emit('join room', roomName);
    });

    // receiving signal
    socket.on('received signal', (data) => {
      console.warn('receiving signal');

      peer.on('signal', (signal) => {
        setTimeout(() => {
          console.warn('returning signal');
          socket.emit('returning signal', {
            signal,
            room: roomName,
          });
        }, [1000]);
      });

      peer.signal(JSON.stringify(data));
    });

    peer.on('data', (data) => {
      replayer.addEvent(JSON.parse(data));
    });

    return () => {
      peer.destroy();
    };
  }, []);

  return <h1>Live Sharing</h1>;
};

export default Live;
