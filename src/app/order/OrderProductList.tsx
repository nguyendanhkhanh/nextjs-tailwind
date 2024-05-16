'use client'

import React, { useEffect, useState } from 'react'
import { PlusIcon, ArrowPathIcon, HeartIcon } from '@heroicons/react/20/solid'
import ProductOrder from './ProductOrder'
import { CartType, CartStorageType, ProductType } from '@/interface/Product'
import { toCurrency } from '@/lib/utils'
import axios from 'axios'
import { HOST } from '@/lib/config'

const ISSERVER = typeof window === "undefined";

function OrderProductList(props: any) {

  const { onClickOrder, onResetOrder, isDone, onChangeTotalProduct } = props

  const [products, setProducts] = useState<ProductType[]>([])
  // const [storageCart, setStorageCart] = useState<CartStorageType[]>(!ISSERVER && JSON.parse(localStorage.getItem('carts') || '[]'))
  const [storageCart, setStorageCart] = useState<CartStorageType[]>([])
  const [carts, setCarts] = useState<CartType[]>([])
  const [totalProduct, setTotalProduct] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  useEffect(() => {
    if (!carts.length) {
      return
    }

    let totalProd = 0
    let totalPrice = 0
    const cartsNotEmpty = carts.filter(product => {
      const existUnit = product.units.find(u => u.quantity)
      return existUnit ? true : false
    })
    carts.forEach(prod => {
      prod.units.forEach(unit => {
        totalProd += unit.quantity
        totalPrice += unit.quantity * prod.price
      })
    })
    setTotalProduct(totalProd)
    setTotalPrice(totalPrice)

    onChangeTotalProduct(totalProd)

    // localStorage.setItem('carts', JSON.stringify(cartsNotEmpty.map(cart => ({
    //   id: cart._id,
    //   units: cart.units
    // }))));
  }, [carts]);

  useEffect(() => {
    getProduct()

  }, [])

  useEffect(() => {
    setCarts(products.map(p => {
      const productInCart = storageCart.find(pc => pc._id === p._id)
      return {
        ...p,
        units: productInCart ? [...productInCart.units] : p.units.map(u => ({ ...u, quantity: 0 }))
      }
    }))
  }, [storageCart, products]);

  useEffect(() => {
    if (isDone) {
      onResetCart()
    }
  }, [isDone])

  const getProduct = async () => {
    const res = await axios.get(HOST + '/api/product-beta?drop=5')
    const data = res.data.data.map((p: any) => {
      return {
        ...p,
        units: p.units.map((u: any) => ({
          ...u,
          buy: 0
        }))
      }
    })
    setProducts(data)
  }


  const onChangeQuantity = (id: string, unitCode: string, quantity: number) => {
    if (quantity < 0) quantity = 0
    if (quantity > 2) quantity = 2
    setCarts(carts.map(product => {
      if (product._id === id) {
        const unit = product.units.find(u => u.code === unitCode)
        if (unit) {
          unit.quantity = quantity
        }
        return product
      } else return product
    }))
  }

  const onUpdateQuantity = (id: string, unitCode: string, type: string, value = 0) => {
    const product = carts.find(p => p._id === id)
    if (!product) return
    const productQty = product.units.reduce(((acc, cur) => acc + cur.quantity), 0)

    if (productQty >= 2) {
      if (type === 'add') return //
    }
    if (productQty === 0) {
      if (type === 'subtract') return
    }
    setCarts(carts.map(product => {
      if (product._id === id) {
        const unit = product.units.find(u => u.code === unitCode)
        if (!unit || (type === 'subtract' && unit.quantity == 0)) {
          return product
        }
        unit.quantity = type === 'add' ? unit.quantity + 1 : unit.quantity - 1
        return product
      } else return product
    }))

  }

  const onResetCart = () => {
    setStorageCart([])
  }

  return (
    <div className='mt-2 flex flex-col items-center px-2 text-gray-900'>
      <div className='flex flex-col items-center'>
        <span className='text-lg '>Danh sách sản phẩm</span>
        <span className='text-sm'>⋆ ˚｡⋆୨♡୧⋆ ˚｡⋆</span>
      </div>

      <div className='mt-2 grid grid-cols-2 gap-2 text-base text-xs'>
        {carts.map((c, i) => (
          <ProductOrder key={i} product={c} onChangeQuantity={onChangeQuantity} onUpdateQuantity={onUpdateQuantity} />
        ))}
      </div>

      <button className="btn w-full my-2 text-gray-900 bg-pink-150" disabled={!totalProduct} onClick={() => onClickOrder(carts, totalPrice)}>
        Đặt hàng
        <HeartIcon className='w-4' />
        {/* <span className="loading loading-spinner w-4"></span> */}
      </button>

      {/* <div className='ae-mini-cart-container'>
        <div className='ae-mini-cart-content'>
          <span>Tổng số lượng: {totalProduct} sản phẩm</span>
          <span>Tổng giá trị: {toCurrency(totalPrice)} </span>
        </div>
        <button className="btn btn-xs self-end w-20 flex flex-col mt-1 text-base text-xs rounded-l-full rounded-r-none" onClick={onResetCart}>
          Đặt lại
          <ArrowPathIcon className='mr-8 w-4' />
        </button>
      </div> */}

    </div>
  )
}

export default OrderProductList
