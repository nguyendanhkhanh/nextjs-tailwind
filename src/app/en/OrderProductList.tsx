'use client'

import React, { useEffect, useState } from 'react'
import { HeartIcon } from '@heroicons/react/20/solid'
import ProductOrder from './ProductOrder'
import { CartType, CartStorageType, ProductType } from '@/interface/Product'
import axios from 'axios'
import { HOST } from '@/lib/config'
import eventEmitter from '@/lib/eventEmitter';

function OrderProductList(props: any) {

  const {
    onClickOrder,
    onChangeProduct,
    productRemove,
    resetProductRemove,
    trackingClickOrder,
    onResetOrder,
    isDone,
    onChangeTotalProduct,
    avaiable
  } = props

  const [products, setProducts] = useState<ProductType[]>([])
  const [storageCart, setStorageCart] = useState<CartStorageType[]>([])
  const [carts, setCarts] = useState<CartType[]>([])
  const [totalProduct, setTotalProduct] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)


  useEffect(() => {
    if (productRemove) {
      removeProduct(productRemove)
    }
    return () => {
    }
  }, [productRemove])

  useEffect(() => {
    if (trackingClickOrder) {
      onClickOrder(carts, totalPrice)
    }
    return () => {
    }
  }, [trackingClickOrder])


  useEffect(() => {
    eventEmitter.on('reloadProducts', reloadProducts);
    return () => {
      eventEmitter.off('reloadProducts', reloadProducts);
    };
  }, [])

  useEffect(() => {
    eventEmitter.on('soldout', reloadProducts);
    return () => {
      eventEmitter.off('soldout', reloadProducts);
    };
  }, [])

  const removeProduct = (prod) => {
    const prodInCart = carts.find(p => p._id == prod._id)
    if (prodInCart) {
      const unit = prodInCart.units.find(u => u.code === prod.unit)
      if (unit) {
        unit.quantity = 0
        setCarts([...carts])
      }
    }
    resetProductRemove()
  }

  const reloadProducts = () => {
    getProduct()
  }

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

    onChangeProduct(carts, totalPrice)

  }, [carts]);

  useEffect(() => {
    getProduct()
  }, [])

  useEffect(() => {
    setCarts(products.map(p => {
      const productInCart = carts.find(pc => pc._id === p._id)
      if (productInCart) {
        productInCart.units = productInCart.units.map(u => {
          const unitInProducts = p.units.find(unitItem => unitItem.code === u.code)
          if (unitInProducts) {
            u.status = unitInProducts.status
            if (unitInProducts.status === 'soldout') {
              u.quantity = 0
            }
          }
          return u
        })
        setCarts(carts)
      }
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

  // const getProduct = async () => {
  //   const res = await axios.get(HOST + '/api/product-beta?lang=en')
  //   const data = res.data.data.map((p: any) => {
  //     return {
  //       ...p,
  //       units: p.units.map((u: any) => ({
  //         ...u,
  //         buy: 0
  //       }))
  //     }
  //   })
  //   setProducts(data)
  // }

  const getProduct = async () => {
    const res = await axios.get(HOST + '/api/product-beta?lang=en&drop=3')
    let data = res.data.data
      .filter(p => p._id != '67d690dfcb2618316a635255')
      .map((p: any) => {
        return {
          ...p,
          units: p.units.map((u: any) => ({
            ...u,
            buy: 0
          })),
          index: p.name == 'Aiko top' ? 3 : p.index
        }
      })
    data = data.sort((a, b) => a.index - b.index)
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

    if (productQty >= 1) {
      if (type === 'add') return eventEmitter.emit('warning' + id, id + unitCode)
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
      <div className='flex w-100 items-center my-2'>
        <img className="ms-1 w-6 me-2" src="./instagram.png" />
        <a className='text-base' href='https://www.instagram.com/amanda.era__/' target='_blank'>instagram.com/amanda.era__</a>
      </div>
      <div className='flex flex-col items-center'>
        <span className='text-lg '>Product List</span>
        <span className='text-sm'>⋆ ˚｡⋆୨♡୧⋆ ˚｡⋆</span>
      </div>

      <div className='mt-2 grid grid-cols-2 gap-2 text-base text-xs'>
        {carts.map((c, i) => (
          <ProductOrder key={i} product={c} onChangeQuantity={onChangeQuantity} onUpdateQuantity={onUpdateQuantity} />
        ))}
      </div>

      <button className="btn w-full my-2 text-gray-900 bg-pink-150" disabled={!totalProduct || !avaiable.status} onClick={() => onClickOrder(carts, totalPrice)}>
        {/* <button className="btn w-full my-2 text-gray-900 bg-pink-150" disabled={true} onClick={() => {}}> */}
        Order now
        <HeartIcon className='w-4' />
      </button>

    </div>
  )
}

export default OrderProductList
