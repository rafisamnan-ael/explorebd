function pathCost(order: number[], durations: number[][], roundTrip: boolean): number {
  let cost = 0;
  for (let i = 0; i < order.length - 1; i += 1) {
    cost += durations[order[i]!]?.[order[i + 1]!] ?? 0;
  }
  if (roundTrip && order.length > 1) {
    cost += durations[order[order.length - 1]!]?.[order[0]!] ?? 0;
  }
  return cost;
}

/** Nearest-neighbour construction starting from index 0. */
export function nearestNeighborOrder(durations: number[][]): number[] {
  const n = durations.length;
  const visited = new Array<boolean>(n).fill(false);
  const order: number[] = [0];
  visited[0] = true;
  for (let step = 1; step < n; step += 1) {
    let best = -1;
    let bestCost = Infinity;
    const last = order[order.length - 1]!;
    for (let j = 0; j < n; j += 1) {
      if (visited[j]) continue;
      const cost = durations[last]?.[j] ?? Infinity;
      if (cost < bestCost) {
        bestCost = cost;
        best = j;
      }
    }
    if (best === -1) break;
    order.push(best);
    visited[best] = true;
  }
  return order;
}

/** 2-opt local search improvement. */
export function twoOpt(order: number[], durations: number[][], roundTrip: boolean): number[] {
  let improved = true;
  let best = [...order];
  let bestCost = pathCost(best, durations, roundTrip);
  let guard = 0;
  while (improved && guard < 200) {
    improved = false;
    guard += 1;
    for (let i = 0; i < best.length - 1; i += 1) {
      for (let k = i + 1; k < best.length; k += 1) {
        const candidate = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)];
        const cost = pathCost(candidate, durations, roundTrip);
        if (cost < bestCost - 1e-9) {
          best = candidate;
          bestCost = cost;
          improved = true;
        }
      }
    }
  }
  return best;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const perm of permutations(rest)) result.push([items[i]!, ...perm]);
  }
  return result;
}

/**
 * For small sets, brute-force all orderings (fixing the start point) and pick
 * the lowest travel time. For larger sets use nearest-neighbour + 2-opt.
 */
export function optimizeOrder(durations: number[][], roundTrip: boolean): number[] {
  const n = durations.length;
  if (n <= 1) return [0];

  if (n <= 7) {
    const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
    let bestOrder = [0, ...rest];
    let bestCost = pathCost(bestOrder, durations, roundTrip);
    for (const perm of permutations(rest)) {
      const order = [0, ...perm];
      const cost = pathCost(order, durations, roundTrip);
      if (cost < bestCost - 1e-9) {
        bestCost = cost;
        bestOrder = order;
      }
    }
    return twoOpt(bestOrder, durations, roundTrip);
  }

  return twoOpt(nearestNeighborOrder(durations), durations, roundTrip);
}
