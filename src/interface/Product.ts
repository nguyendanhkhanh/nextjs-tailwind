export interface ProductType {
  id: string
  name: string
  units: {
    code: string
  }[]
  price: number
  image: string
}

export interface CartType {
  id: string
  name: string
  units: {
    code: string
    quantity: number
  }[]
  price: number
  image: string
}

export interface CartRequest {
  id: string
  unit: string
  quantity: number
}

export interface CartStorageType {
  id: string
  units: {
    code: string,
    quantity: number
  }[]
}
