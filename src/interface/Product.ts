export interface ProductType {
  _id: string
  name: string
  units: {
    code: string
  }[]
  price: number
  image: string
}

export interface CartType {
  _id: string
  name: string
  units: {
    code: string
    quantity: number
  }[]
  price: number
  image: string
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
    quantity: number
  }[]
}
