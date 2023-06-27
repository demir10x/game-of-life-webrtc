import { useEffect, useState } from 'react';
import { record } from 'rrweb';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { getNextIterationCells, initializeGrid } from '../utils';
import { Row, Cell } from '../components/index';

const ROWS = 50;
const COLS = 50;
const T = 500;

const Record = () => {
  const [cells, setCells] = useState([]);
  const [iteration, setIteration] = useState(0);

  useEffect((_) => {
    const items = initializeGrid(ROWS, COLS);
    setCells(items);
    setInterval((_) => {
      setIteration((state) => state + 1);
    }, T);
  }, []);

  useEffect(
    (_) => {
      if (!iteration) return;
      const items = getNextIterationCells(cells);
      setCells(items);
    },
    [iteration]
  );

  const handleClick = (i, j) => {
    setCells((state) => {
      const newState = [...state];
      newState[i][j] = !state[i][j];
      console.log(state[i][j]);
      return newState;
    });
  };

  useEffect(() => {
    const socket = io(
      'https://signaling-server-bm-7010f2e071ee.herokuapp.com/'
    );
    const roomName = 'testing';

    socket.on('connect', () => {
      // Join socket room
      socket.emit('join room', roomName);
    });

    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    console.warn('peer', peer);

    peer.on('signal', (signal) => {
      console.warn('sending signal');
      socket.emit('sending signal', {
        signal,
        room: roomName,
      });
    });

    socket.on('returned signal', (payload) => {
      peer.signal(JSON.stringify(payload));
    });

    peer.on('connect', () => {
      console.warn('Connection Established');

      console.warn('coming here');
      record({
        emit(event) {
          peer.send(JSON.stringify(event));
        },
      });
    });

    peer.on('error', (error) => {
      console.warn('error came');
      peer.destroy(error);
    });
  }, []);

  return (
    <div>
      <h1 style={{ color: 'white', margin: 0 }}>{iteration}</h1>
      {cells.map((row, rowIndex) => (
        <Row key={`ROW_${rowIndex}`}>
          {row.map((cell, colIndex) => (
            <Cell
              key={`COL_${colIndex}`}
              isActive={cell}
              onClick={(_) => handleClick(rowIndex, colIndex)}
            />
          ))}
        </Row>
      ))}
    </div>
  );
};

export default Record;
