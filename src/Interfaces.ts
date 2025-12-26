export interface Phone {
    imei: string,
    sim_number: string,
    hasSIM: boolean,
    tested: boolean,
    shipped: boolean,
    [key: string]: any
}

export interface SIM {
    sim_number: string,
    status: string,
    [key: string]: any
}

export interface Line {
    phone_number: string,
    sim_number: string,
    subscription_id: string,
    status: string,
    owner_type: string,
    source: string,
    [key: string]: any
}

export function getPropertyValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}