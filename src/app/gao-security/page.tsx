'use client'

import { calculateShip, toCurrency, toThousand } from '@/lib/utils'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { HOST } from '@/lib/config'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import moment from 'moment'

export default function OrderBeta() {

  const [orders, setOrders] = useState([])
  const [orderViews, setOrderViews] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('asc')
  const [dvvc, setDVVC] = useState(2)
  const [duplicate, setDuplicate] = useState([])
  const [duplicatePhone, setDuplicatePhone] = useState([])
  const [duplicateIG, setDuplicateIG] = useState([])

  useEffect(() => {
    getDuplicate()
    getDuplicatePhone()
    getDuplicateIg()
    return () => {
    }
  }, [])

  const getDuplicate = async () => {
    const res = await axios.get(HOST + '/api/order/duplicate?field=deviceCode')
    setDuplicate(res.data.data)
  }
  const getDuplicatePhone = async () => {
    const res = await axios.get(HOST + '/api/order/duplicate?field=phone')
    setDuplicatePhone(res.data.data)
  }
  const getDuplicateIg = async () => {
    const res = await axios.get(HOST + '/api/order/duplicate?field=ig')
    setDuplicateIG(res.data.data)
  }

  const cancelOrder = async (cartId: string) => {
    await axios.post(HOST + '/api/order/cancel', {
      cartId: cartId
    })
    location.reload()

  }

  return (
    <div>
      DEVICECODE
      {duplicate.map((data, i) => (
        <div key={data._id}>
          (( {i + 1}. ))
          <span>KEY: {data._id}</span><br />
          <span>List length: {data.orders.length}</span>
          {data.orders.map(o => (
            <div key={o._id} >
              <div className='flex items-start justify-between'>
                <div>
                  <span>_id: {o._id}</span><br />
                  <span>Phone: {o.info.phone}</span><br />
                  <span>IG: {o.info.ig}</span><br />
                  <span>Name: {o.info.name}</span><br />
                  <button className="btn mx-1 bg-white text-gray-900" onClick={() => cancelOrder(o._id)}>
                    Cancel order
                  </button>
                </div>
                <div>
                  {o.products.map((p, pi) => (
                    <div key={p._id}>
                      {pi + 1}.<br />
                      <span>prodName: {p.name}</span><br />
                      <span>prodUnit: {p.unit}</span><br />
                    </div>
                  ))}
                </div>
                <br />
              </div>
              . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
            </div>

          ))}
          ========================================================
        </div>
      ))}
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<br />
      PHONE
      {duplicatePhone.map((data, i) => (
        <div key={data._id}>
          (( {i + 1}. ))
          <span>KEY: {data._id}</span><br />
          <span>List length: {data.orders.length}</span>
          {data.orders.map(o => (
            <div key={o._id} >
              <div className='flex items-start justify-between'>
                <div>
                  <span>_id: {o._id}</span><br />
                  <span>Phone: {o.info.phone}</span><br />
                  <span>IG: {o.info.ig}</span><br />
                  <span>Name: {o.info.name}</span><br />
                  <button className="btn mx-1 bg-white text-gray-900" onClick={() => cancelOrder(o._id)}>
                    Cancel order
                  </button>
                </div>
                <div>
                  {o.products.map((p, pi) => (
                    <div key={p._id}>
                      {pi + 1}.<br />
                      <span>prodName: {p.name}</span><br />
                      <span>prodUnit: {p.unit}</span><br />
                    </div>
                  ))}
                </div>
                <br />
              </div>
              . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
            </div>

          ))}
          ========================================================
        </div>
      ))}
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<br />
      IG
      {duplicateIG.map((data, i) => (
        <div key={data._id}>
          (( {i + 1}. ))
          <span>KEY: {data._id}</span><br />
          <span>List length: {data.orders.length}</span>
          {data.orders.map(o => (
            <div key={o._id} >
              <div className='flex items-start justify-between'>
                <div>
                  <span>_id: {o._id}</span><br />
                  <span>Phone: {o.info.phone}</span><br />
                  <span>IG: {o.info.ig}</span><br />
                  <span>Name: {o.info.name}</span><br />
                  <button className="btn mx-1 bg-white text-gray-900" onClick={() => cancelOrder(o._id)}>
                    Cancel order
                  </button>
                </div>
                <div>
                  {o.products.map((p, pi) => (
                    <div key={p._id}>
                      {pi + 1}.<br />
                      <span>prodName: {p.name}</span><br />
                      <span>prodUnit: {p.unit}</span><br />
                    </div>
                  ))}
                </div>
                <br />
              </div>
              . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
            </div>

          ))}
          ========================================================
        </div>
      ))}
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<br />
    </div >

  );
}
