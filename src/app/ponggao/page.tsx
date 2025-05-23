'use client'

import { calculateShip, toCurrency, toThousand } from '@/lib/utils'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { HOST } from '@/lib/config'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import moment from 'moment'

export default function OrderBeta() {

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [orderViews, setOrderViews] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('asc')
  const [dvvc, setDVVC] = useState(2)
  const [check, setCheck] = useState('ORDER')

  useEffect(() => {
    getOrder()
    return () => {
    }
  }, [])

  useEffect(() => {
    if (check === 'ORDER') {
      getOrder()
    } else {
      getProduct()
    }
    return () => {
    }
  }, [check])

  useEffect(() => {
    let views = orders.filter(ord => {
      if (!ord.info.phone.includes(search) && !ord.info.ig.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (dvvc != 2 && ord.statusLogistic != dvvc) {
        return false
      }
      return true
    })
    if (sort !== 'asc') views.reverse()
    setOrderViews(views)

    return () => {
    }
  }, [orders, search, sort, dvvc])


  const [message, setMesMage] = useState('')

  const sendMessage = async (order) => {
    let content = ''
    if (order.payment == 'ck' || order.payment == 'cod') {
      content = `Amanda gửi nàng xác nhận đơn đặt hàng thành công gồm có:\n\n${order.products.map(p => (`${p.pre ? '[PRE-ORDER]' : ''} ${p.name} size ${p.unit} (x${p.quantity}): ${toThousand(p.quantity * p.price)}`)).join('\n')}\n\nPhí ship: ${toThousand(order.ship)}\n${order.totalAmount < order.totalPayment ? `Cọc: ${toThousand(order.totalAmount - order.totalPayment)}` : ''}\nTổng tiền: ${toThousand(order.totalAmount)} ${order.discount ? '(đã bao gồm giảm 5% feedback)' : ''}\nHình thức thanh toán: ${order.payment === 'ck' ? 'Chuyển khoản' : 'COD'}\n\nThông tin nhận hàng:\n${order.info.name}\n${order.info.phone}\n${order.info.address} - ${order.info.ward.name}, ${order.info.district.name}, ${order.info.province.name}\n\nCảm ơn nàng đã mua hàng tại Amanda Era ❤️
    `
    } else {
      content = `Your order is confirmed:\n\n${order.products.map(p => (`${p.pre ? '[PRE-ORDER]' : ''} ${p.name} size ${p.unit} (x${p.quantity}): $${(p.quantity * p.price)}`)).join('\n')}\n\nShipping fee: $${order.ship}\n\nTotal: $${(order.totalAmount)}\n\nShipping information:\n${order.info.name}\n${order.info.phone}\n${order.info.address} - ${order.info.ward.name}, ${order.info.district.name}, ${order.info.province.name}\n\nThank you for your order❤️
    `
    }

    copy(content)
    await axios.get(HOST + `/api/order/markSend?_id=${order._id}&status=${!Number(order.statusMessage) ? 1 : 0}`)
    getOrder()
  }

  const markDVVC = async (order) => {
    const content = `${order.info.address} ${order.info.ward.name}, ${order.info.district.name}, ${order.info.province.name}`
    copy(content)
    await axios.get(HOST + `/api/order/markDVVC?_id=${order._id}`)
    getOrder()
  }

  const getOrder = async () => {
    const res = await axios.get(HOST + '/api/order')
    const list =
      res.data.data.map((ord, index) => ({
        ...ord,
        stt: index + 1,
        statusMessage: ord.updateAt <= '2024-05-18T07:03:06.249Z' ? 1 : ord.statusMessage
      }))
    list.reverse()
    setOrders(list)
  }

  const getProduct = async () => {
    const res = await axios.get(HOST + '/api/product-beta/checking')
    setProducts(res.data.data)
    console.log("🚀 ~ getProduct ~ res:", res)
  }

  const copy = (value: string) => {
    console.log("🚀 ~ copy ~ value:", value)
    const el = document.createElement("textarea");
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  const cancelOrder = async (order) => {
    await axios.delete(HOST + `/api/order?_id=${order._id}`)
  }

  return (
    <div className='bg-black text-white'>
      <div>
        {/* {orders.map(order => (<div className='mb-4' key={order._id}>
          <div>{order._id}</div>
          <div>{order.info.phone} - {order.info.name} - {order.info.ig}</div>
          <div>{order.updateAt}</div>
          <div>{order.products.map(p => (
            <div key={order._id + p._id}>{p.name} (x{p.quantity})</div>
          ))}</div>
          <div>{order.totalPrice}</div>
          <div>discount {order.discount}</div>
          <span>{order.ship1} ck</span> ------ <span>{order.ship2} cod</span> <br />
          <span>{order.totalPayment1}</span> ------ <span>{order.totalPayment2}</span>
          <div>{order.info.address} - {order.info.ward.name}, {order.info.district.name}, {order.info.province.name}</div>
        </div>))} */}
        <div className='flex pt-2 justify-between pe-3'>
          <button className='bg-green-500 text-gray-800 p-2 ms-3' onClick={() => setCheck('ORDER')}>Check đơn</button>
          <button className='bg-blue-500 text-gray-800 p-2 ms-3' onClick={() => setCheck('PRODUCT')}>Check sản phẩm</button>
        </div>
        {check === 'ORDER'
          ? <>
            <div className='flex px-2 mb-4'>
              <input type="text" placeholder="Sdt hoặc ig" className="ae-input text-gray-900 mx-1" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="ae-select w-full  text-gray-900 mx-1" value={dvvc} onChange={e => setDVVC(e.target.value)}>
                <option value={''} disabled>Trạng thái DVVC</option>
                <option value={2}>Tất cả</option>
                <option value={1} >Đã lên đơn</option>
                <option value={0} >Chưa lên đơn</option>
              </select>
              <select className="ae-select w-full  text-gray-900 mx-1" value={sort} onChange={e => setSort(e.target.value)}>
                <option value={''} disabled>Sắp xếp</option>
                <option value={'asc'} >Mới đến cũ</option>
                <option value={'desc'} >Cũ đến mới</option>
              </select>
            </div>


            {orderViews.map((order, index) => (<div className='mb-6 ' key={order._id}>
              <div>STT: {order.stt} <span className="text-center text-lg text-white font-semibold">{order.products.filter(p => p.pre).length ? ('[PRE-ORDER] ' + (order.shipOption == 'all' ? 'Đợi đồ pre-order về rồi ship chung 1 lượt' : 'Ship đồ có sẵn trước, đồ pre-order sau')) : ' '}</span></div>
              <div>{moment(order.updateAt).format('DD/MM/YYYY HH:mm')} - {order._id}</div>
              <div className='flex'>
                <span className="text-center text-lg text-white font-semibold">{order.info.phone}</span>
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(order.info.phone)} />
              </div>
              <div className='flex'>
                <span className="text-center text-lg text-white font-semibold">{order.info.name}</span>
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(order.info.name)} />
              </div>
              <div className='flex'>
                <span className="text-center text-lg text-white font-semibold">{order.info.address}</span>
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(order.info.address)} />
              </div>

              <div className='flex'>
                <span className="text-start text-lg text-white font-semibold">{order.info.ward.name}, {order.info.district.name}, {order.info.province.name}</span>
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(`${order.info.ward.name}, ${order.info.district.name}, ${order.info.province.name}`)} />
              </div>
              <div>{order.products.map(p => (
                <div key={order._id + p._id + p.unit}>{p.pre ? '[PRE-ORDER]' : ''} {p.name + ' size ' + p.unit + ' '} (x{p.quantity})</div>
              ))}</div>
              {/* <span>Quà tặng: {order.info.gift || 'Không có'}</span> */}
              <div className='flex'>
                <span className="text-center text-lg text-green-500 font-semibold">{order.payment === 'cod' ? order.totalAmount : 0}</span> ({order.payment})
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(order.payment === 'cod' ? order.totalAmount : 0)} />
              </div>
              <div className='flex'>
                <span className="text-center text-lg text-red-500 font-semibold">{order.info.ig}</span>
                <DocumentDuplicateIcon className=" ms-1 h-6 w-6 mb-2 text-white cursor-pointer" onClick={() => copy(order.info.ig)} />
              </div>

              {order.info.note ? <div>KHÁCH NOTE: {order.info.note}</div> : <></>}
              {order.payment == 'ckPayPal' || order.payment == 'ckRemitly' ? <div>ĐƠN NƯỚC NGOÀI</div> : <></>}

              {order.statusMessage === 1 ? <button className='bg-green-500 text-gray-800 p-2 ms-3' onClick={() => sendMessage(order)}>Đã gửi TN</button> : <button className='bg-white text-gray-800 p-2 ms-3' onClick={() => sendMessage(order)}>Message</button>}
              {order.statusLogistic === 1 ? <button className='bg-green-500 text-gray-800 p-2 ms-3' onClick={() => markDVVC(order)} >Đã lên ĐVVC</button> : <button className='bg-red-500 text-gray-800 p-2 ms-3' onClick={() => markDVVC(order)}>Đánh dấu đã lên ĐVVC</button>}

              {/* <button className='bg-red-500 text-gray-800 p-2 ms-3' onClick={() => markDVVC(order)}>Hủy đơn</button> */}


              <div className='hidden '>
                Amanda xác nhận đơn đặt hàng thành công gồm có: <br />
                <div className="mt-2 flex flex-col text-sm text-gray-500">
                  {order.products.map((prod, i) => (
                    <div className="flex items-center justify-between " key={i}>
                      <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(x{prod.quantity}): {toThousand(prod.price * prod.quantity)}</span></span>
                    </div>
                  ))}
                  <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                  <div>Phí ship: {toThousand(order.ship)}</div>
                  {/* {order.info.gift ? <div>Quà tặng: {order.info.gift}</div> : <></>} */}
                  {order.totalAmount < order.totalPayment ? <div>Cọc: {toThousand(order.totalAmount - order.totalPayment)}</div> : <></>}
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-semibold">Tổng tiền: {toThousand(order.totalAmount)} {order.discount ? '(đã bao gồm giảm 5% feedback)' : ''}</span>
                  </div>
                  <div>Hình thức thanh toán: {order.payment === 'ck' ? 'Chuyển khoản' : 'COD'}</div>
                  <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                  <div>Thông tin nhận hàng:</div>
                  <div>{order.info.name}</div>
                  <div>{order.info.phone}</div>
                  <div>{order.info.address} - {order.info.ward.name}, {order.info.district.name}, {order.info.province.name}</div>
                  <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                  Cảm ơn nàng đã mua hàng tại Amanda Era ❤️
                  {/* {totalValue > 650000 && <div>Với đơn hàng có giá trị sản phẩm trên 650k, nàng vui lòng cọc chuyển khoản trước 50k giùm shop nha.</div>} */}
                </div>
              </div>

              <div>--------------------------------------------------------</div>
            </div>))}
          </>
          : <div>
            <div className="overflow-x-auto mt-4">
              <table className="table table-xs">
                <thead className='text-md text-white'>
                  <tr>
                    <th>STT</th>
                    <th>SP</th>
                    <th>Size</th>
                    <th>SL ban đầu</th>
                    <th style={{ color: 'red' }}>Đã bán</th>
                    <th>Còn lại</th>
                    <th>WEB</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) =>
                    <>
                      {p.units.map((u, uIdx) => <>
                        {uIdx == 0
                          ?
                          <tr>
                            <th>{index + 1}</th>
                            <td>
                              <img className='w-12 h-16 object-cover rounded' src={p.image} />
                              {p.units.length < 2 && <div>{p.name}</div>}
                            </td>
                            <td>{u.code} </td>
                            <td>{u.originQty} </td>
                            <td className='font-bold' style={{ color: 'green' }}>{u.sold}</td>
                            <td>{u.originQty - u.sold}</td>
                            <td>{u.quantity}</td>
                          </tr>
                          :
                          <tr>
                            <th></th>
                            <td className='ml-[-100px]'>{p.name}</td>
                            <td>{u.code} </td>
                            <td>{u.originQty} </td>
                            <td className='font-bold' style={{ color: 'green' }}>{u.sold}</td>
                            <td>{u.originQty - u.sold}</td>
                            <td>{u.quantity}</td>
                          </tr>
                        }
                      </>)}
                    </>

                  )}

                </tbody>
              </table>
            </div>
          </div>
        }

      </div>

    </div >

  );
}
