export function getElementDirections(type) {
  switch (type) {
    case "power":
      return [0, 2]; 
    case "wire_h":
      return [1, 3]; 
    case "wire_v":
      return [0, 2]; 
    case "wire_corner_tr":
      return [0, 1]; 
    case "wire_corner_br":
      return [1, 2]; 
    case "wire_corner_bl":
      return [2, 3]; 
    case "wire_corner_tl":
      return [0, 3]; 
    case "bulb":
    case "resistor":
    case "led":
    case "switch":
      return [0, 1, 2, 3]; 
    default:
      return [0, 1, 2, 3]; 
  }
}

export function areCellsConnected(cellA, indexA, cellB, indexB, cols) {
  const rowA = Math.floor(indexA / cols);
  const colA = indexA % cols;
  const rowB = Math.floor(indexB / cols);
  const colB = indexB % cols;
  let dirAtoB = -1;
  if (rowB === rowA - 1 && colB === colA) dirAtoB = 0; 
  if (rowB === rowA + 1 && colB === colA) dirAtoB = 2; 
  if (rowB === rowA && colB === colA + 1) dirAtoB = 1; 
  if (rowB === rowA && colB === colA - 1) dirAtoB = 3; 

  if (dirAtoB === -1) return false; 

  const dirBtoA = (dirAtoB + 2) % 4; 

  const dirsA = getElementDirections(cellA.type);
  const dirsB = getElementDirections(cellB.type);

  return dirsA.includes(dirAtoB) && dirsB.includes(dirBtoA);
}

export function getGridNeighbors(index, totalCells, cols) {
  const neighbors = [];
  if (index - cols >= 0) neighbors.push(index - cols); 
  if (index + cols < totalCells) neighbors.push(index + cols); 
  if (index % cols !== 0) neighbors.push(index - 1); 
  if ((index + 1) % cols !== 0) neighbors.push(index + 1); 
  return neighbors;
}

export function findPathBetween(
  startIndex,
  endIndex,
  cellsMap,
  cols,
  totalCells = 300
) {
  const queue = [{ current: startIndex, path: [startIndex] }];
  const visited = new Set([startIndex]);

  while (queue.length) {
    const { current, path } = queue.shift();

    if (current === endIndex) {
      return path;
    }

    const neighbors = getGridNeighbors(current, totalCells, cols);
    for (const n of neighbors) {
      if (!cellsMap[n] || visited.has(n)) continue;

      if (areCellsConnected(cellsMap[current], current, cellsMap[n], n, cols)) {
        visited.add(n);
        queue.push({ current: n, path: [...path, n] });
      }
    }
  }
  return null; 
}

export function getParameterName(name) {
  const name_ru = name === 'voltage' ? "Напряжение" : name === 'resistance' ? "Сопротивление" : "Сила тока";
  return name_ru;
}
