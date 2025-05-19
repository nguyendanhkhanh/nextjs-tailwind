import axios from "axios";
import moment from 'moment'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import BackgroundModal from "@/components/BackgroundModal";
import { HOST, ISSERVER } from "@/lib/config";
import { calculateShip, generateRandomString, toCurrency, toRounded, toThousand, validatePhone } from "@/lib/utils";
import DialogCancelOrderSuccess from "@/components/dialog/DialogCancelOrderSuccess";


const DialogOrderList = (props: any) => {

  const { deviceCode } = props


  const cancelButtonRef = useRef(null)
  const cancelUpdateButtonRef = useRef(null)
  const divRef = useRef(null);
  const divUpdateRef = useRef(null);

  const [orders, setOrders] = useState<any[]>([])
  const [dialogCancelOrder, setDialogCancelOrder] = useState(false)
  const [orderUpdate, setOrderUpdate] = useState<any>(null)
  const [errorUpdate, setErrorUpdate] = useState('')
  const [info, setInfo] = useState<any>({
    ig: '',
    phone: '',
    name: '',
    address: '',
    province: {
      code: '',
      name: ''
    },
    district: {
      code: '',
      name: ''
    },
    ward: {
      code: '',
      name: ''
    },
    note: '',
  })
  const [phoneWarning, setPhoneWarning] = useState('')
  const [addressAll, setAddressAll] = useState<any>(null)
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])


  useEffect(() => {
    getOrder()
    return () => {
    }
  }, [])

  useEffect(() => {
    if (orderUpdate) {
      setInfo(orderUpdate.info)
    }
    return () => {
    }
  }, [orderUpdate])

  useEffect(() => {
    if (info.phone) {
      checkPhone()
    }
    return () => {
    }
  }, [info?.phone])

  useEffect(() => {
    const p = provinces.find(it => it.code === info.province.code)
    if (p) {
      const districtList: any[] = []
      p.children.forEach((it: string) => {
        const dist = addressAll.districts[it]
        districtList.push({
          ...dist,
          code: it
        })
      })
      setDistricts(districtList)
    }
    return () => {
    }
  }, [provinces, info.province.code])

  useEffect(() => {
    const d = districts.find(it => it.code === info.district.code)
    if (d) {
      const wardList: any[] = []
      d.children.forEach((it: string) => {
        const w = addressAll.wards[it]
        wardList.push({
          ...w,
          code: it
        })
      })
      setWards(wardList)
    }

    return () => {
    }
  }, [districts, info.district.code])

  useEffect(() => {
    if (orderUpdate) {
      setTimeout(() => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur()
      }, 500) // Delay 100ms cho DOM ổn định
    }
  }, [orderUpdate])

  const getAllAddress = async () => {
    const res = await axios.get(HOST + '/api/order-beta/getAddressCode')
    const provinceList: any[] = []
    const dataProvince = res.data.provinces
    Object.keys(dataProvince).forEach(key => {
      if (key === "01" || key === "79" || key === "48") {
        provinceList.unshift({
          ...dataProvince[key],
          code: key
        })
      } else {
        provinceList.push({
          ...dataProvince[key],
          code: key
        })
      }

    });
    setProvinces(provinceList)
    setAddressAll(res.data)
  }


  const checkPhone = async () => {
    if (!validatePhone(info.phone)) {
      setPhoneWarning('Hãy nhập SĐT đúng')
    } else {
      setPhoneWarning('')
    }
  }

  const getOrder = async () => {
    const res = await axios.get(HOST + '/api/order/by-device?deviceCode=' + deviceCode)
    const list =
      res.data.data.map((ord, index) => ({
        ...ord,
        stt: index + 1
      }))
    list.reverse()
    setOrders(list)
  }

  const isMoreThan10Minutes = (isoStringA, isoStringB) => {
    // Chuyển chuỗi ISOString thành đối tượng Date
    const dateA = new Date(isoStringA);
    const dateB = new Date(isoStringB);

    // Tính khoảng cách thời gian giữa hai mốc thời gian (B - A) tính bằng mili giây
    const timeDifference = dateB - dateA;

    // Chuyển đổi mili giây thành phút
    const timeDifferenceInMinutes = timeDifference / (1000 * 60);

    // Kiểm tra nếu khoảng cách thời gian lớn hơn 10 phút
    return timeDifferenceInMinutes > 10;
  }

  const cancelOrderApi = async (id: string) => {
    await axios.post(HOST + '/api/order/cancel', {
      cartId: id
    })
    setDialogCancelOrder(true)

    setTimeout(() => {
      setDialogCancelOrder(false)
      location.reload()
    }, 3000);
  }

  const setInfoPhone = async (value: string) => {
    setInfo({ ...info, phone: value })
  }

  const updateProvince = (code: string) => {
    const p = provinces.find(it => it.code === code)
    if (p) {
      setInfo({
        ...info,
        province: {
          code: p.code,
          name: p.name
        },
        district: {
          code: '',
          name: ''
        },
        ward: {
          code: '',
          name: ''
        }
      })
    }
  }

  const updateDistrict = (code: string) => {
    const d = districts.find(it => it.code === code)
    if (d) setInfo({
      ...info,
      district: {
        code: d.code,
        name: d.name
      },
      ward: {
        code: '',
        name: ''
      }
    })
  }

  const updateWard = (code: string) => {
    const w = wards.find(it => it.code === code)
    if (w) setInfo({
      ...info,
      ward: {
        code: w.code,
        name: w.name
      }
    })
  }

  const onUpdateAddress = async (order: any) => {
    await getAllAddress()
    setOrderUpdate(order)
  }

  const onSubmitUpdateAddress = async () => {
    if (!validatePhone(info.phone)) {
      return setErrorUpdate('Hãy nhập SĐT đúng')
    }
    if (!info.phone || !info.name || !info.address || !info.province.code || !info.district.code || !info.ward.code) {
      return setErrorUpdate('Hãy nhập đầy đủ thông tin')
    }

    await axios.post(HOST + '/api/order/update-address', {
      phone: info.phone,
      name: info.name,
      address: info.address,
      province: info.province.name,
      district: info.district.name,
      ward: info.ward.name,
      _id: orderUpdate._id
    })
    setOrderUpdate(null)
    getOrder()
  }

  const onCancelUpdateAddress = () => {
    setOrderUpdate(null)
  }

  return (
    <>
      <Transition.Root show={orders.length ? true : false} as={Fragment}>
        <Dialog as="div" className="z-10" initialFocus={cancelButtonRef} onClose={() => { }}>
          <BackgroundModal />

          <div className="fixed top-[7vh] z-10 w-screen  overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all  w-[360px]">
                  <div ref={divRef} className="bg-white max-h-[70vh] overflow-y-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 flex justify-start">
                      Nàng đang có {orders.length} đơn hàng:
                    </Dialog.Title>
                    {orders.map((order, index) => (<div className='mb-6 text-gray-900 mt-2 text-sm' key={order._id}>
                      <div className="text-gray-600 text-sm italic">{moment(order.updateAt).format('DD/MM/YYYY HH:mm')}</div>
                      <div className='flex '>
                        <span className="text-md text-gray-900 font-semibold me-1">Người nhận: </span>
                        <span className="text-center text-md text-gray-900">{order.info.name} - {order.info.phone}</span>
                      </div>
                      <div className='flex'>
                        <span className="text-start text-md text-gray-900"><span className="font-semibold">Địa chỉ: </span>{order.info.address}, {order.info.ward.name}, {order.info.district.name}, {order.info.province.name}</span>
                      </div>
                      {order.info.note
                        ? <div className='flex mb-2'>
                          <span className="text-start text-md text-gray-900"><span className="font-semibold">Note: </span>{order.info.note}</span>
                        </div>
                        : <></>
                      }
                      <span className="text-md text-gray-900 font-semibold me-1 ">Danh sách sản phẩm: </span>
                      <div>{order.products.map(p => (
                        <div key={order._id + p._id + p.unit}>- {p.pre ? '[PRE-ORDER] ' : ''} {p.name + ' size ' + p.unit + ' '} (x{p.quantity})</div>
                      ))}</div>
                      <div className="font-semibold">Tổng tiền: {toThousand(order.totalAmount)} - {order.payment === 'cod' ? 'COD' : 'Chuyển khoản'}
                      </div>
                      <div className="w-100 flex justify-between px-2 mt-2">
                        {!order.statusLogistic && !order.addressChanged && <button className="p-2 flex-1 bg-pink-100 text-gray-900 me-2" onClick={() => { onUpdateAddress(order) }}>
                          Sửa địa chỉ
                        </button>}
                        {order.statusMessage == 0 && !isMoreThan10Minutes(order.updateAt, new Date().toISOString()) ? <button className='bg-red-500 rounded text-white p-2' onClick={() => cancelOrderApi(order._id)}>Hủy đơn</button> : <></>}

                      </div>

                      <div>----------------------------------------------------</div>
                    </div>))}

                  </div>

                  <div className="bg-white px-4 py-3 flex justify-between ">
                    {orders.length < 2 ? <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => { if (orders.length < 2) setOrders([]) }}>
                      Đồng ý
                    </button> : <></>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <DialogCancelOrderSuccess visible={dialogCancelOrder} />
      <Transition.Root show={orderUpdate ? true : false} as={Fragment}>
        <Dialog as="div" className="z-40" initialFocus={cancelUpdateButtonRef} onClose={() => { }}>
          <BackgroundModal />

          <div className="fixed top-[7vh] z-10 w-screen  overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative z-40 transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all  w-[360px]">
                  <div ref={divUpdateRef} className="bg-white max-h-[70vh] overflow-y-auto px-4 pb-0 pt-5 sm:p-6 sm:pb-4">
                    <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 flex justify-start">
                      Cập nhật địa chỉ:
                    </Dialog.Title>
                  </div>

                  <div className="text-gray-800 px-4 z-40">

                    <input ref={cancelUpdateButtonRef} autoFocus type="text" placeholder="Số điện thoại" className="ae-input" value={info.phone} onChange={(e) => setInfoPhone(e.target.value)} />
                    {phoneWarning && <span className="text-mini italic text-start text-red-500" >{phoneWarning}</span>}

                    <input type="text" placeholder="Tên" className="ae-input" value={info.name} onChange={(e) => setInfo({
                      ...info,
                      name: e.target.value
                    })} />

                    <select className="ae-select w-full" value={info.province.code} onChange={e => updateProvince(e.target.value)}>
                      <option value={''} disabled>Tỉnh / Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>

                    <div className="flex justify-between w-full">
                      <select className="ae-select w-[150px]" value={info.district.code} onChange={e => updateDistrict(e.target.value)}>
                        <option disabled value={''}>Quận / Huyện</option>
                        {districts.map(d => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                      <select className="ae-select w-[150px]" value={info.ward.code} onChange={e => updateWard(e.target.value)}>
                        <option value={''} disabled>Xã / Phường</option>
                        {wards.map(p => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <textarea placeholder="Địa chỉ chi tiết" className="ae-textarea mt-4" value={info.address} onChange={(e) => setInfo({
                      ...info,
                      address: e.target.value
                    })} />
                    {/* 
                    <textarea placeholder="Có nhắn gì cho Amanda khum nè" className="ae-textarea mt-2" value={info.note} onChange={(e) => setInfo({
                      ...info,
                      note: e.target.value
                    })} /> */}
                    <div className="text-black text-center italic text-sm">(Bạn có thể cập nhật địa chỉ 1 lần)</div>
                    <div className="text-red-500 text-center italic text-sm">{errorUpdate}</div>

                  </div>

                  <div className="bg-white px-4 py-3 flex justify-between ">
                    <button className="btn flex-1 me-2 text-gray-900" onClick={() => onCancelUpdateAddress()}>
                      Hủy
                    </button>
                    <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => onSubmitUpdateAddress()}>
                      Đồng ý
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

    </>

  )
}
export default DialogOrderList