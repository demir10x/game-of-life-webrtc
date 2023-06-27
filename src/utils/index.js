const getStatus = (grid, i, j) => {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  if (i < 0 || i > ROWS - 1 || j < 0 || j > COLS - 1) return null;
  return grid[i][j];
};

const countActiveAndInactiveNeighbors = (grid, i, j) => {
  let active = 0;
  let inactive = 0;
  for (let y = i - 1; y <= i + 1; y++) {
    for (let x = j - 1; x <= j + 1; x++) {
      if (y === i && x === j) continue;
      const status = getStatus(grid, y, x);
      if (status === null) continue;
      else if (status === false) inactive++;
      else if (status === true) active++;
    }
  }
  return { active, inactive };
};

export const getNextIterationCells = (cells) => {
  const ROWS = cells.length;
  const COLS = cells[0].length;
  const items = [];
  for (let i = 0; i < ROWS; i++) {
    items.push([]);
    for (let j = 0; j < COLS; j++) {
      const { active } = countActiveAndInactiveNeighbors(cells, i, j);
      let status = cells[i][j];
      if (status) {
        if (active < 2) status = false;
        else if (active >= 2 && active <= 3) status = true;
        else if (active > 3) status = false;
      } else {
        if (active === 3) status = true;
      }
      items[i].push(status);
    }
  }
  return items;
};

export const initializeGrid = (ROWS, COLS) => {
  const items = [];
  for (let i = 0; i < ROWS; i++) {
    items.push([]);
    for (let j = 0; j < COLS; j++) {
      items[i].push(Math.round(Math.random() * 100) % 2 === 0);
    }
  }
  return items;
};
