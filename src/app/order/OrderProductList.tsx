'use client'

import React, { useEffect, useState } from 'react'
import { PlusIcon, ArrowPathIcon, HeartIcon } from '@heroicons/react/20/solid'
import ProductOrder from './ProductOrder'
import { CartType, CartStorageType, ProductType } from '@/interface/Product'
import { toCurrency } from '@/lib/utils'

const ISSERVER = typeof window === "undefined";

function OrderProductList(props: any) {

  const { onClickOrder, onResetOrder, isDone } = props

  const [products, setProducts] = useState<ProductType[]>([])
  const [storageCart, setStorageCart] = useState<CartStorageType[]>(!ISSERVER && JSON.parse(localStorage.getItem('carts') || '[]'))
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

    localStorage.setItem('carts', JSON.stringify(cartsNotEmpty.map(cart => ({
      id: cart.id,
      units: cart.units
    }))));
  }, [carts]);

  useEffect(() => {
    setProducts([{
      id: '1',
      name: 'Cherry top',
      price: 270000,
      image: 'https://i.ibb.co/YRWcvWf/432159730-930952155242894-7842094914078003532-n.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    }, {
      id: '2',
      name: 'Rossa top',
      price: 235000,
      image: 'https://i.ibb.co/Bj7CZNy/o-hoa-nh-1-size.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    },
    {
      id: '3',
      name: 'Doris top ngắn tay',
      price: 230000,
      image: 'https://i.ibb.co/yYbMmmH/o-doris-xanh.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    },
    {
      id: '4',
      name: 'Sarah',
      price: 225000,
      image: 'https://i.ibb.co/1njyxpQ/431835017-1437723856840282-7198374109524220768-n.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    },
    {
      id: '5',
      name: 'Amelia Dollette',
      price: 230000,
      image: 'https://i.ibb.co/B3Ds9YV/o-s-c-caro.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    },
    {
      id: '6',
      name: 'Adela',
      price: 240000,
      image: 'https://i.ibb.co/PTrn5dL/o-th-boi.jpg',
      units: [{ code: 'M' }, { code: 'L' }]
    }])
  }, [])

  useEffect(() => {
    setCarts(products.map(p => {
      const productInCart = storageCart.find(pc => pc.id === p.id)
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


  const onChangeQuantity = (id: string, unitCode: string, quantity: number) => {
    if (quantity < 0) quantity = 0
    if (quantity > 2) quantity = 2
    setCarts(carts.map(product => {
      if (product.id === id) {
        const unit = product.units.find(u => u.code === unitCode)
        if (unit) {
          unit.quantity = quantity
        }
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
          <ProductOrder key={i} product={c} onChangeQuantity={onChangeQuantity} />
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
