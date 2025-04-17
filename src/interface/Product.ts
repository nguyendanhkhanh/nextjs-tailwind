export interface ProductType {
  _id: string
  name: string
  enName: string
  enPrice: number
  units: {
    code: string
    quantity: number
    status: string
  }[]
  price: number
  image: string
  index: number
}

export interface CartType {
  _id: string
  name: string
  units: {
    code: string
    quantity: number
    status: string
  }[]
  price: number
  image: string
  pre?: boolean
}

export interface CartRequest {
  _id: string
  unit: string
  quantity: number
}

export interface CartStorageType {
  _id: string
  units: {
    code: string,
    quantity: number,
    status: string
  }[]
}
