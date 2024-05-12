'use client'

import Image from "next/image";
import Countdown from "@/app/order/Countdown";
import OrderProductList from "@/app/order/OrderProductList";
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import BackgroundModal from "@/components/BackgroundModal";
import { CartRequest, CartType } from "@/interface/Product";
import { toCurrency, toThousand } from "@/lib/utils";
import axios from "axios";
import { HOST } from "@/lib/config";

export default function Home() {

  const [loading, setLoading] = useState(false)
  const [dialogConfirm, setDialogConfirm] = useState(true)
  const [carts, setCarts] = useState<any[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [step2, setStep2] = useState(false)
  const cancelButtonRef = useRef(null)

  const [info, setInfo] = useState({
    ig: '',
    phone: '',
    name: '',
    address: '',
    provinceCode: '',
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
    }
  })
  const [addressAll, setAddressAll] = useState<any>(null)
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [province, setProvince] = useState(null)
  const [district, setDistrict] = useState(null)
  const [ward, setWard] = useState(null)
  const [payment, setPayment] = useState('ck')

  useEffect(() => {
    getAllAddress()
    return () => {
    }
  }, [])

  const onOpenModalConfirm = (carts: CartType[], totalPrice = 0) => {
    const cartsOrder = carts.filter(product => {
      const existUnit = product.units.find(u => u.quantity)
      return existUnit ? true : false
    })
    const cartsConvert = [] as any[]
    cartsOrder.forEach(prod => {
      prod.units.forEach(unit => {
        if (unit.quantity) {
          cartsConvert.push({
            id: prod.id,
            name: prod.name,
            unit: unit.code,
            quantity: unit.quantity,
            price: prod.price,
          })
        }
      })
    })
    setCarts(cartsConvert)
    setDialogConfirm(true)
    setTotalPrice(totalPrice)
  }

  const nextStep = () => {
    if (!step2) return setStep2(true)
    if (step2) return console.log(info.province);
  }

  const getAllAddress = async () => {
    const res = await axios.get(HOST + '/api/order-beta/getAddressCode')
    console.log("🚀 ~ getAllAddress ~ res:", res.data)
    const provinceList: any[] = []
    const dataProvince = res.data.provinces
    Object.keys(dataProvince).forEach(key => {
      provinceList.push({
        ...dataProvince[key],
        code: key
      })
    });
    console.log(provinceList);
    setProvinces(provinceList)
    setAddressAll(res.data)
  }

  const updateProvince = (code: string) => {
    console.log(2183712983);

    const p = provinces.find(it => it.code === code)
    if (p) setInfo({
      ...info,
      province: {
        code: p.code,
        name: p.name
      }
    })
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

  const updateDistrict = (code: string) => {
    const d = districts.find(it => it.code === code)
    if (d) setInfo({
      ...info,
      district: {
        code: d.code,
        name: d.name
      }
    })
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

  return (
    <main className="min-h-screen min-w-[375px] max-w-screen-xl bg-gradient-to-t from-[#fbecef] to bg-pink-50 flex flex-col justify-between">
      <header className="min-w-full flex justify-center items-center py-3">
        <img className="w-24" src="./logo-circle.svg" />
      </header>

      <div className="ae-drop-container ">
        <Countdown />
        <OrderProductList
          onClickOrder={onOpenModalConfirm} />
      </div>

      <Transition.Root show={dialogConfirm} as={Fragment}>
        <Dialog as="div" className=" z-10" initialFocus={cancelButtonRef} onClose={setDialogConfirm}>
          <BackgroundModal />

          <div className="fixed top-6 z-10 w-screen  overflow-y-auto">
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
                  <div className="bg-white max-h-[75vh] overflow-y-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 ">
                        <img className="w-24" src="./logo-circle.svg" />
                      </div>
                      <div className="mt-2 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 text-center">
                          Amanda xác nhận đơn hàng của nàng gồm có:
                        </Dialog.Title>
                        <div className="mt-2 flex flex-col text-sm text-gray-500">
                          {carts.map((prod, i) => (
                            <div className="flex items-center justify-between" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(x{prod.quantity})</span></span>
                              <span className="font-semibold ms-2">{toThousand(prod.price * prod.quantity)}</span>
                            </div>
                          ))}
                          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>

                          <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold">Tổng tiền hàng:</span> <br />
                            <span className="font-semibold ms-2">{toThousand(totalPrice)}</span>
                          </div>
                          <span className="text-mini italic " >(chưa gồm phí ship)</span>
                        </div>
                      </div>
                      {step2 && <div className="mt-2 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 mt-4">
                          Thông tin của nàng:
                        </Dialog.Title>
                        <div className="text-gray-800">

                          <input type="text" placeholder="IG" className="ae-input" value={info.ig} onChange={(e) => setInfo({
                            ...info,
                            ig: e.target.value
                          })} />
                          <input type="text" placeholder="Số điện thoại" className="ae-input" value={info.phone} onChange={(e) => setInfo({
                            ...info,
                            phone: e.target.value
                          })} />
                          <input type="text" placeholder="Tên của nàng" className="ae-input" value={info.phone} onChange={(e) => setInfo({
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

                          <textarea placeholder="Địa chỉ chi tiết" className="ae-textarea" value={info.address} onChange={(e) => setInfo({
                            ...info,
                            address: e.target.value
                          })} />

                          <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 my-2">
                            Hình thức thanh toán:
                          </Dialog.Title>
                          <div className="flex items-center">
                            <div className="grow">
                              <div className="flex items-center">
                                <input type="radio" name="radio-1" className="radio me-2" value='ck' checked={payment === 'ck'} onChange={e => setPayment('ck')} />
                                <span>CK full</span>
                              </div>
                              <span className="text-mini italic " >(phí ship 16k)</span>
                            </div>
                            <div className="grow">
                              <div className="flex items-center ">
                                <input type="radio" name="radio-1" className="radio me-2" value='ck' checked={payment === 'cod'} onChange={e => setPayment('cod')} />
                                <span>COD</span>
                              </div>
                              <span className="text-mini italic " >(phí ship 22k)</span>
                            </div>
                          </div>

                        </div>

                      </div>}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 flex justify-between">
                    <button className="btn mx-2 bg-pink-100" onClick={() => setDialogConfirm(false)}>
                      Coi thêm
                    </button>
                    <button className="btn flex-1 bg-pink-200" onClick={() => nextStep()}>
                      Tiếp tục
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>


      {/* Open the modal using document.getElementById('ID').showModal() method */}
      {<div id="my_modal_1" className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </div>}

      <footer className="ae-order-footer">
        <span>꒰ა 𝑳𝒆𝒕 𝒖𝒔 𝒆𝒎𝒃𝒓𝒂𝒄𝒆 𝒚𝒐𝒖𝒓 𝒈𝒊𝒓𝒍𝒚 𝒈𝒊𝒓𝒍 ໒꒱</span>
      </footer>
    </main>
  );
}
