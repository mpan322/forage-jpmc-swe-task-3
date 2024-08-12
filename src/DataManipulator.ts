import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  lower_bound: number | undefined,
  upper_bound: number | undefined,
  moving_average: number | undefined,
  timestamp: Date,
  alert: number | undefined,
}

/**
 * A class that manages a sliding window of values,
 * and calculation of long term stats.
 */
export class StatsWindow {
  sum: number = 0;
  sumOfSquares: number = 0;
  maxSize: number;
  window: number[] = []; 

  constructor(windowSize: number) {
    this.maxSize = windowSize;
  }

  /**
   * Adds a new value to the window.
   *
   * @param value the new value
   */
  add(value: number) {
    // add the new value to the window
    this.window.push(value);
    this.sum += value;
    this.sumOfSquares += value * value;

    // if the window is full, remove the oldest value
    if (this.maxSize < this.window.length) {
      const removed = this.window.shift();
      if (removed === undefined) {
        alert("[ERROR] Logic error within code calculating moving average");
        return;
      }
      this.sum -= removed;
      this.sumOfSquares -= removed * removed;
    }
  }

  /**
   * Calculates the long term stats based on the current window.
   *
   * @returns the stats (moving average, standard deviation)
   */
  getStats() {
    const n = this.window.length;

    let average = undefined;
    if (n !== 0) {
      average = this.sum / n;
    }

    let variance = undefined;
    if (n !== 0 && n !== 1) {
      variance = (this.sumOfSquares - Math.pow(this.sum, 2) / n) / (n - 1);
    }

    const stdev = variance === undefined ? undefined : Math.sqrt(variance);

    return {
      average,
      stdev,
    };
  }
}

export class DataManipulator {
  // manages the long term stats
  static ratioWindow = new StatsWindow(20);

  static generateRow(serverResponds: ServerRespond[]): Row {
    const abc = serverResponds[0];
    const def = serverResponds[1];

    // calculate basic information
    const abcPrice = (abc.top_bid.price + abc.top_ask.price) / 2;
    const defPrice = (def.top_bid.price + def.top_ask.price) / 2;
    const timestamp = abc.timestamp > def.timestamp ? abc.timestamp : def.timestamp;
    const ratio = defPrice === 0 ? -1 : abcPrice / defPrice;
    if (ratio === -1) {
      alert("[WARNING] attempted division by zero when calculating ratio");
    }

    // update and get the long term stats
    this.ratioWindow.add(ratio);
    const { stdev, average } = this.ratioWindow.getStats();

    // further calculations based on the long term stats
    let lowerBound = undefined;
    let upperBound = undefined;
    let triggerAlert = undefined;
    if (average !== undefined && stdev !== undefined) {
      lowerBound = average - 2 * stdev;
      upperBound = average + 2 * stdev;

      if (ratio < lowerBound || ratio > upperBound) {
        triggerAlert = ratio;
      }
    }

    return {
      price_abc: abcPrice,
      price_def: defPrice,
      lower_bound: lowerBound,
      upper_bound: upperBound,
      moving_average: average,
      ratio: ratio,
      timestamp,
      alert: triggerAlert,
    };
  }
}
