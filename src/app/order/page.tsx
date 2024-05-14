'use client'

import Image from "next/image";
import Countdown from "@/app/order/Countdown";
import OrderProductList from "@/app/order/OrderProductList";
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import BackgroundModal from "@/components/BackgroundModal";
import { CartRequest, CartType } from "@/interface/Product";
import { calculateShip, toCurrency, toRounded, toThousand, validatePhone } from "@/lib/utils";
import { isFreeship } from "@/lib/common";
import axios from "axios";
import { HOST } from "@/lib/config";

export default function Home() {

  const [loading, setLoading] = useState(false)
  const [dialogConfirm, setDialogConfirm] = useState(false)
  const [carts, setCarts] = useState<any[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [ship, setShip] = useState(0)
  const [step2, setStep2] = useState(false)
  const [step, setStep] = useState(0)
  const cancelButtonRef = useRef(null)

  const [info, setInfo] = useState({
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
    gift: 'Kẹp tóc hoa lan ngẫu nhiên'
  })
  const [phoneWarning, setPhoneWarning] = useState('')
  const [addressAll, setAddressAll] = useState<any>(null)
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [payment, setPayment] = useState('ck')
  const [urlQr, setUrlQr] = useState('')

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
    setStep(1)
    setDialogConfirm(true)
    setTotalPrice(totalPrice)
  }

  const nextStep = () => {
    if (step === 2) {
      if (!info.ig || !info.name || !info.phone || !info.province.code || !info.district.code || !info.ward.code || !info.address) {
        return alert('Vui lòng điển đủ thông tin')
      }
      if (phoneWarning) {
        return alert('Vui lòng nhập đúng số điện thoại')
      }
      let shipValue = calculateShip(info.province.code, payment, totalPrice)
      setShip(shipValue)
      let totalPriceAfterDiscount = totalPrice
      let discountValue = 0
      if (discountPercent) {
        discountValue = totalPrice * discountPercent / 100
        setDiscount(discountValue)
        totalPriceAfterDiscount = totalPrice - discountValue
      }
      const totalPaymentValue = totalPriceAfterDiscount + ship
      setTotalPayment(totalPaymentValue)

      const url = `https://api.vietqr.io/image/970407-19037257529012-Dgrd4Uv.jpg?accountName=NGUYEN%20DANH%20KHANH&amount=${toRounded(totalPaymentValue)}&addInfo=${info.phone}%20${payment === 'ck' ? 'CK%20full' : 'Coc%2050k'}`
      setUrlQr(url)
    }
    setStep(step + 1)
  }

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

  const setInfoPhone = async (value: string) => {
    setInfo({ ...info, phone: value })
    if (!validatePhone(value)) {
      setPhoneWarning('Hãy nhập SĐT đúng')
      setDiscountPercent(0)
    } else {
      setPhoneWarning('')
      const res = await axios.get(HOST + '/api/customer?phone=' + value)
      if (res.data.data) {
        setDiscountPercent(res.data.data.discount)
      } else {
        setDiscountPercent(0)
      }
    }
  }

  const updateProvince = (code: string) => {
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
      <header className="bg-pink-50 z-50 fixed top-0 min-w-full max-w-screen-xl flex justify-between items-center px-4 py-3 text-gray-900">
        <div></div>
        <img className="w-40" src="./logo-square.png" />
        <div className="relative mb-1">
          <ShoppingBagIcon className="h-6 w-6 gray-900" />
          <div className="bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-mini text-white absolute top-4 left-3">3</div>
        </div>

      </header>

      <div className="ae-drop-container mt-20">
        <Countdown />
        <OrderProductList
          onClickOrder={onOpenModalConfirm} />
      </div>

      <Transition.Root show={dialogConfirm} as={Fragment}>
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
                  <div className="bg-white max-h-[70vh] overflow-y-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mx-auto flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mb-4">
                        <img className="w-20" src="./logo-circle.svg" />
                      </div>
                      {step < 4 && <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 flex justify-start">
                          Amanda xác nhận đơn hàng nàng gồm có:
                        </Dialog.Title>
                        <div className="mt-2 flex flex-col text-sm text-gray-500">
                          {carts.map((prod, i) => (
                            <div className="flex items-center justify-between" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(x{prod.quantity})</span></span>
                              <span className="font-semibold ms-2">{toThousand(prod.price * prod.quantity)}</span>
                            </div>
                          ))}
                          {step === 3 && discount && <div className="flex items-center justify-between mt-1 italic">
                            <span className="font-semibold ">Giảm giá:</span>
                            <span className="font-semibold ms-2">- {toThousand(discount)}</span>
                          </div>}
                          {step === 3 && <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold">Phí ship:</span>
                            <span className="font-semibold ms-2">{toThousand(ship)}</span>
                          </div>}

                          <div className="flex items-center justify-between mt-1">
                            {step < 3 &&
                              <>
                                <span className="font-semibold">Tổng tiền:</span>
                                <span className="font-semibold ms-2">{toThousand(totalPrice)}</span>
                              </>}
                            {step >= 3 &&
                              <>
                                <span className="font-semibold">Tổng tiền:</span><br />
                                <span className="font-semibold ms-2">{toThousand(totalPayment)}</span>
                              </>}
                          </div>
                          {step < 3 && <span className="text-mini italic text-start" >{isFreeship(totalPrice) ? '(freeship với đơn trên 800k)' : '(chưa gồm phí ship)'}</span>}

                          {totalPrice >= 500000 &&
                            <>
                              <div className="flex justify-between items-center">
                                <span className="font-semibold mt-1">Quà tặng kèm:</span>
                                {step < 3 && <select className="select select-sm rounded-sm  w-52" value={info.gift} onChange={e => setInfo({ ...info, gift: e.target.value })}>
                                  <option value={'Kẹp tóc hoa lan ngẫu nhiên'} disabled>Kẹp tóc hoa lan</option>
                                  <option value='Kẹp tóc hoa lan tím pastel'>Kẹp tóc tím pastel</option>
                                  <option value='Kẹp tóc hoa lan màu hồng pastel'>Kẹp tóc hồng pastel</option>
                                  <option value='Kẹp tóc hoa lan màu xanh pastel'>Kẹp tóc xanh pastel</option>
                                  <option value='Kẹp tóc hoa lan màu hồng'>Kẹp tóc hồng</option>
                                  <option value='Kẹp tóc hoa lan màu trắng'>Kẹp tóc trắng</option>
                                </select>}
                                {step === 3 && <span className="mt-1">{info.gift}</span>}
                              </div>
                              {step < 3 && <span className="text-mini italic text-start" >(tặng kèm với đơn trên 500k)</span>}
                            </>}


                          {/* <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span> */}
                        </div>

                        {step === 3 && <div className="flex flex-col">
                          <Dialog.Title as="h3" className="font-semibold leading-6 mt-2 text-gray-500 flex justify-start">
                            Thông tin chuyển khoản:
                          </Dialog.Title>
                          <span className="text-mini italic text-red-500 text-left">(Quét mã QR dưới để ck, sau khi ck babi nhớ chụp màn hình r gửi qua IG cho Amanda nha)</span>
                          <img src={urlQr} />
                        </div>}
                      </div>}
                      {step == 2 && <div className="mt-2 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 mt-4">
                          Thông tin của nàng:
                        </Dialog.Title>
                        <div className="text-gray-800">

                          <input type="text" placeholder="Id tài khoản IG (nhớ điền đúng nha)" className="ae-input" value={info.ig} onChange={(e) => setInfo({
                            ...info,
                            ig: e.target.value
                          })} />
                          <input type="text" placeholder="Số điện thoại" className="ae-input" value={info.phone} onChange={(e) => setInfoPhone(e.target.value)} />
                          {discountPercent ? <span className="text-mini italic text-start text-green-600" >(được giảm 5% feedback)</span> : <span></span>}
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

                          <textarea placeholder="Địa chỉ chi tiết" className="ae-textarea mt-4" style={{ fontSize: '16px' }} value={info.address} onChange={(e) => setInfo({
                            ...info,
                            address: e.target.value
                          })} />

                          <textarea placeholder="Có nhắn gì cho Amanda khum nè" className="ae-textarea mt-2" style={{ fontSize: '16px' }} value={info.note} onChange={(e) => setInfo({
                            ...info,
                            note: e.target.value
                          })} />

                          <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 my-2">
                            Hình thức thanh toán:
                          </Dialog.Title>
                          <div className="flex items-center justify-around">
                            <div className=" flex flex-col">
                              <div className="flex items-center">
                                <input type="radio" name="radio-1" className="radio me-2" value='ck' checked={payment === 'ck'} onChange={e => setPayment('ck')} />
                                <span>CK full</span>
                              </div>
                              {info.province.code && !isFreeship(totalPrice) && <span className="text-mini italic text-start ms-4" >(phí ship {toThousand(calculateShip(info.province.code, 'ck', totalPrice))})</span>}
                            </div>
                            <div className=" flex flex-col">
                              <div className="flex items-center ">
                                <input type="radio" name="radio-1" className="radio me-2" value='ck' checked={payment === 'cod'} onChange={e => setPayment('cod')} />
                                <span>COD</span>
                              </div>
                              {info.province.code && !isFreeship(totalPrice) && <span className="text-mini italic text-start ms-3" >(phí ship {toThousand(calculateShip(info.province.code, 'cod', totalPrice))})</span>}
                            </div>
                          </div>
                        </div>
                      </div>}
                      {step === 4 &&
                        <div>
                          <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start">
                            🎀 Nàng vui lòng hoàn tất chuyển khoản trong vòng 12 tiếng, quá thời hạn Amanda xin phép hủy đơn nha
                          </Dialog.Title>
                          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                          <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start ">
                            🎀 Tin nhắn xác nhận đơn đặt hàng thành công sẽ được Amanda gửi qua IG từ 6-12 tiếng
                          </Dialog.Title>
                          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                          <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start ">
                            🎀 Cảm ơn nàng đã mua hàng tại Amanda.era ❤️
                          </Dialog.Title>
                        </div>
                      }
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 flex justify-between ">
                    {step < 4 && <button className="btn mx-2 bg-white text-gray-900" onClick={() => {
                      if (step === 1) {
                        setDialogConfirm(false)
                      }
                      setStep(step - 1)
                    }}>
                      Quay lại
                    </button>}
                    {step < 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => nextStep()}>
                      Tiếp tục
                    </button>}
                    {step === 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => nextStep()}>
                      Chuyển khoản
                    </button>}
                    {step === 4 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => nextStep()}>
                      Hoàn tất
                    </button>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>


      {/* Open the modal using document.getElementById('ID').showModal() method */}
      {
        <div id="my_modal_1" className="modal" role="dialog">
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
        </div>
      }

      <footer className="ae-order-footer">
        <div className="text-sm flex items-center">
          <span className="font-medium">Amanda Era </span>
          <img className="ms-1 w-4" src="./bow.png" />
        </div>
        <span>꒰ა 𝑳𝒆𝒕 𝒖𝒔 𝒆𝒎𝒃𝒓𝒂𝒄𝒆 𝒚𝒐𝒖𝒓 𝒈𝒊𝒓𝒍𝒚 𝒈𝒊𝒓𝒍 ໒꒱</span>
      </footer>
    </main >
  );
}
