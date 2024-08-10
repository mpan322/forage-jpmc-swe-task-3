import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  upper_bound: number,
  lower_bound: number,
  ratio: number,
  timestamp: Date,
  trigger_alert: number | undefined,
}


export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    const abc = serverResponds[0];
    const def = serverResponds[1];
    const deviation = 0.05; // deviation for defining upper and lower bounds

    // calculate basic row fields
    const priceABC = (abc.top_ask.price + abc.top_bid.price) / 2;
    const priceDEF = (def.top_ask.price + def.top_bid.price) / 2;
    let ratio = (priceDEF === 0) ? -1 : priceABC / priceDEF;  // TODO: determine how to best handle erroneous value
    const upperBound = 1 + deviation;
    const lowerBound = 1 - deviation;

    // choose the later timestamp
    const timestamp = (abc.timestamp > def.timestamp) ? abc.timestamp : def.timestamp;
    // triggering condition: ratio leaves bounds
    const triggerAlert = (ratio > upperBound || ratio < lowerBound) ? ratio : undefined;

    return {
      price_abc: priceABC,
      ratio: ratio,
      price_def: priceDEF,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      timestamp: timestamp,
      trigger_alert: triggerAlert,
    };
  }
}
