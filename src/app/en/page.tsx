'use client'

import Countdown from "@/components/CountdownEn";
import OrderProductList from "./OrderProductList";
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DocumentDuplicateIcon, ShoppingBagIcon, XCircleIcon, HeartIcon } from '@heroicons/react/24/outline'
import BackgroundModal from "@/components/BackgroundModal";
import { CartType } from "@/interface/Product";
import { calculateShipWorld, generateRandomString, toRounded, toDollar, validatePhone, dollarToVnd } from "@/lib/utils";
import { isFreeship } from "@/lib/common";
import eventEmitter from '@/lib/eventEmitter';
import axios from "axios";
import { HOST, ISSERVER } from "@/lib/config";
import CountDownCompleteEn from "@/components/CountDownCompleteEn";
import DialogCancelOrderSuccess from "@/components/DialogCancelOrderSuccess";
import moment from 'moment'

export default function Home() {

  const divRef = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [isMerge, setIsMerge] = useState(false);

  const [deviceCode, setDeviceCode] = useState('');

  const [dialogConfirm, setDialogConfirm] = useState(false)
  const [carts, setCarts] = useState<any[]>([])
  const [totalProduct, setTotalProduct] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [ship, setShip] = useState(0)
  const [deposite, setDeposite] = useState(0)
  const [step, setStep] = useState(0)
  const cancelButtonRef = useRef(null)

  const [startCountDown, setStartCountDown] = useState(false)

  const [dialogCancelOrder, setDialogCancelOrder] = useState(false)

  const [info, setInfo] = useState(!ISSERVER && localStorage.getItem('info') ? JSON.parse(localStorage.getItem('info') || '{}') : {
    ig: '',
    phone: '',
    name: '',
    address: '',
    country: '',
    countrySelect: 'COUNTRY',
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
    postal: '',
    note: '',
    gift: ''
  })
  const [phoneWarning, setPhoneWarning] = useState('')
  const [addressAll, setAddressAll] = useState<any>(null)
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [payment, setPayment] = useState('ckPayPal')
  const [urlQr, setUrlQr] = useState('')
  const [cartId, setCartId] = useState('')
  const cartIdRef = useRef(cartId);
  const cartsRef = useRef(carts)
  const [productRemove, setProductRemove] = useState(null)
  const [trackingClickOrder, setTrackingClickOrder] = useState(false)


  const [soldout, setSoldout] = useState([])


  const [isDone, setIsDone] = useState(false)


  const [orders, setOrders] = useState<any[]>([])


  useEffect(() => {
    getDeviceCode()

    return () => {
    }
  }, [])

  useEffect(() => {
    cartIdRef.current = cartId; // Cập nhật giá trị ref mỗi khi state thay đổi
  }, [cartId]);

  useEffect(() => {
    cartsRef.current = carts; // Cập nhật giá trị ref mỗi khi state thay đổi
  }, [carts]);


  useEffect(() => {
    let storedDeviceCode = localStorage.getItem('deviceCode');
    if (!storedDeviceCode) {
      storedDeviceCode = generateRandomString(16);
      localStorage.setItem('deviceCode', storedDeviceCode);
    }
    setDeviceCode(storedDeviceCode);
  }, []);

  useEffect(() => {
    getAllAddress()
    return () => {
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('info', JSON.stringify(info));
    return () => {
    }
  }, [info.ig, info.phone, info.name, info.address, info.province.code, info.district.code, info.ward.code, info.province.name, info.district.name, info.ward.name, info.country, info.countrySelect, info.postal])

  // useEffect(() => {
  //   if (info.phone) {
  //     checkPhone()
  //   }
  //   return () => {
  //   }
  // }, [info.phone])

  useEffect(() => {
    window.addEventListener("beforeunload", (ev) => {
      // handleOut()
    });
    return () => {
      window.removeEventListener('beforeunload', () => { });
    }
  }, [])

  const handleOut = () => {
    const currentCartId = cartIdRef.current;
    const currentCarts = cartsRef.current;
    if (currentCarts.length && currentCartId) {
      cancelOrder(currentCartId)
      // Thực hiện hành động trước khi tab bị đóng
      console.log("Tab trình duyệt sắp bị đóng");
      // Hiển thị hộp thoại xác nhận (tùy thuộc vào trình duyệt)
      const confirmationMessage = "Are you sure you want to leave this page?";
      event.returnValue = confirmationMessage; // Gecko, Trident, Chrome 34+
      return confirmationMessage; // Gecko, WebKit, Chrome <34
    }
  }

  const checkPhone = async () => {
    if (!validatePhone(info.phone)) {
      setPhoneWarning('Hãy nhập SĐT đúng')
      setDiscountPercent(0)
    } else {
      setPhoneWarning('')
      const res = await axios.get(HOST + '/api/customer?phone=' + info.phone)
      if (res.data.data) {
        setDiscountPercent(res.data.data.discount)
      } else {
        setDiscountPercent(0)
      }
    }
  }

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


  const getDeviceCode = async () => {
    let storedDeviceCode: any = localStorage.getItem('deviceCode');
    if (!storedDeviceCode) {
      const res = await axios.get(HOST + '/api/order-beta/deviceCode')
      storedDeviceCode = res.data.data;
      localStorage.setItem('deviceCode', storedDeviceCode);
    } else {
      await axios.get(HOST + `/api/order-beta/deviceCode?deviceCode=${storedDeviceCode}`)
      // storedDeviceCode = res.data || generateRandomString(16);
      // localStorage.setItem('deviceCode', storedDeviceCode);
    }
    setDeviceCode(storedDeviceCode);

    getOrder(storedDeviceCode)
  }

  const getOrder = async (deviceCode: string) => {
    const res = await axios.get(HOST + '/api/order/by-device?deviceCode=' + deviceCode)
    console.log("🚀 ~ getOrder ~ res:", res.data.data)
    const list =
      res.data.data.map((ord, index) => ({
        ...ord,
        stt: index + 1
      }))
    list.reverse()
    setOrders(list)
  }

  const onChangeProduct = (carts: CartType[], totalPrice = 0) => {
    const cartsOrder = carts.filter(product => {
      const existUnit = product.units.find(u => u.quantity)
      return existUnit ? true : false
    })
    const cartsConvert = [] as any[]
    cartsOrder.forEach(prod => {
      prod.units.forEach(unit => {
        if (unit.quantity) {
          cartsConvert.push({
            _id: prod._id,
            name: prod.name,
            unit: unit.code,
            quantity: unit.quantity,
            price: prod.price,
            image: prod.image
          })
        }
      })
    })
    setCarts(cartsConvert)
    setTotalPrice(totalPrice)
  }

  const onOpenModalConfirm = (carts: CartType[], totalPrice = 0) => {
    setIsDone(false)
    setTrackingClickOrder(false)
    const cartsOrder = carts.filter(product => {
      const existUnit = product.units.find(u => u.quantity)
      return existUnit ? true : false
    })
    const cartsConvert = [] as any[]
    cartsOrder.forEach(prod => {
      prod.units.forEach(unit => {
        if (unit.quantity) {
          cartsConvert.push({
            _id: prod._id,
            name: prod.name,
            unit: unit.code,
            quantity: unit.quantity,
            price: prod.price,
            image: prod.image

          })
        }
      })
    })
    setCarts(cartsConvert)
    setTotalPrice(totalPrice)
    setStep(1)
    setDialogConfirm(true)
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


  const nextStep = () => {

    setTimeout(() => {
      if (divRef.current) {
        const scrollPosition = divRef.current.scrollHeight - divRef.current.clientHeight - (step === 1 ? 20 : 40);
        divRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }
    }, 200);

    if (step === 1) {
      setStep(step + 1)
      setSoldout([])
    }

    if (step === 2) {
      if (!info.ig || !info.name || !info.phone || !info.province.name || !info.district.name || !info.ward.name || !info.address) {
        return alert('Please fill in all information')
      }
      if (phoneWarning) {
        return alert('Please enter correct phone number')
      }
      let shipValue = calculateShipWorld(info.country)
      setShip(shipValue)
      let totalPriceAfterDiscount = totalPrice
      let discountValue = 0
      if (discountPercent) {
        discountValue = totalPrice * discountPercent / 100
        setDiscount(discountValue)
        totalPriceAfterDiscount = totalPrice - discountValue
      }
      // let depositValue = 0
      // // if (payment === 'cod' && totalPrice >= 500000) {
      // //   depositValue = toRounded(totalPrice * 0.2)
      // //   console.log("🚀 ~ nextStep ~ depositValue:", depositValue)
      // // }
      // setDeposite(depositValue)
      const totalAmountValue = totalPriceAfterDiscount + shipValue
      setTotalAmount(totalAmountValue)
      const totalPaymentValue = totalAmountValue
      setTotalPayment(totalPaymentValue)

      const bankValue = dollarToVnd(totalPaymentValue)

      if (bankValue) {
        const url = `https://api.vietqr.io/image/970407-19037257529012-Dgrd4Uv.jpg?accountName=NGUYEN%20DANH%20KHANH&amount=${toRounded(bankValue)}&addInfo=${info.phone}%20${payment === 'ck' ? 'CK%20full' : 'Coc%2020'}`
        setUrlQr(url)
      }

      submitOrder(shipValue, 0)
    }

    if (step === 3) {
      customerCompleteOrder()
      setStep(step + 1)
    }

  }

  const submitOrder = async (shipValue: number, depositValue: number) => {

    const res = await axios.post(HOST + '/api/order', {
      carts: carts,
      info: info,
      deviceCode: deviceCode,
      cartId: cartId,
      ship: shipValue,
      payment: payment,
      deposite: depositValue,
      isMerge: isMerge
    })
    const resp = res.data.data
    if (resp.soldoutList.length) {
      setSoldout(resp.soldoutList)
      const newCarts = carts.filter(c => {
        const soldCart = resp.soldoutList.find(s => s._id === c._id)
        if (soldCart) return false
        return true
      })
      setCarts(newCarts)
      let totalPrice = 0
      newCarts.forEach(prod => {
        totalPrice += prod.quantity * prod.price
      })
      setTotalPrice(totalPrice)
      setStep(1)
      eventEmitter.emit('soldout')
    }
    if (resp.cartId) {
      setCartId(resp.cartId)
      setStep(step + 1)
      setStartCountDown(true)
      // var timeoutCancel = setTimeout(() => {
      //   cancelOrder(resp.cartId)
      // }, 5 * 60 * 1000);
    }
  }

  const cancelOrder = async (id: string) => {
    const currentCartId = cartIdRef.current;
    const currentCarts = cartsRef.current;
    if (currentCarts.length && currentCartId) {
      setCarts([])
      setCartId('')
      if (id) {
        await axios.post(HOST + '/api/order/cancel', {
          cartId: id
        })
        setDialogCancelOrder(true)
      }
      setTimeout(() => {
        setDialogCancelOrder(false)
        location.reload()
      }, 2000);
    }
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

  const customerCompleteOrder = async () => {
    await axios.post(HOST + '/api/order/customer-complete', {
      cartId: cartId
    })
    setCarts([])
    setCartId('')
    setStartCountDown(false)
  }

  const done = () => {
    setDialogConfirm(false)
    setIsDone(true)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    location.reload()
  }

  const copy = (value = '') => {
    const el = document.createElement("textarea");
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
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

  const onRemoveProductInCart = (prod: any) => {
    setProductRemove(prod)
  }
  const resetProductRemove = () => {
    setProductRemove(null)
  }

  return (
    <main className="min-h-screen min-w-[375px] bg-gradient-to-t from-[#fbecef] to bg-pink-50 flex flex-col justify-between">
      <header className="bg-pink-50 z-50 fixed top-0 min-w-full max-w-screen-xl flex justify-between items-center px-4 py-3 text-gray-900">
        <div className="cursor-pointer" onClick={() => {
          window.location.href = 'https://amandaera.com/';
        }}>
          {/* <img className="w-8" src="./united-kingdom.png" /> */}
          <div className="flex align-center font-semibold">
            <img className="w-8" src="./earth.png" />
            <span className="mt-1 ms-1">EN</span>
          </div>
        </div>
        <img className="w-40" src="./logo-square.png" />
        <div className="dropdown dropdown-end">
          {/* <div  role="button" className="btn btn-ghost rounded-btn">Dropdown</div> */}
          <div tabIndex={0} role="button" className="relative mb-1 cursor-pointer">
            <ShoppingBagIcon className="h-6 w-6 gray-900" />
            <div className="bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-mini text-white absolute top-4 left-3">{totalProduct}</div>
          </div>

          <div tabIndex={0} className="menu dropdown-content bg-white z-[1]  mt-4 w-80 pr-2 shadow text-center min-h-64">
            <span className="text-xl font-semibold mb-2">CARTS</span>
            {carts.length
              ?
              <>
                <div className=" max-h-96 overflow-y-auto ">
                  {carts.map((prod, i) => (
                    <div className="fle items-center justify-between " key={i}>
                      <div className="flex items-center ">
                        <img className='w-20 h-20 object-cover rounded-lg border border-gray-50 mr-2' src={prod.image} />
                        <div className="flex flex-col items-start flex-1">
                          <span >{prod.name + ' size ' + prod.unit + ' '}</span>
                          <div className="text-md">
                            <span className="">{prod.quantity} x </span>
                            <span className="font-medium ">{toDollar(prod.price * prod.quantity)}</span>
                          </div>
                        </div>
                        <XCircleIcon className="h-6 w-6 gray-900 cursor-pointer" onClick={() => onRemoveProductInCart(prod)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex  justify-between mt-4 px-1 text-md">
                  <span className="">Total:</span>
                  <span className="font-semibold ms-2">{toDollar(totalPrice)}</span>
                </div>
                <div className="flex  justify-between px-1 text-md">
                  <span className="text-mini italic text-start">(shipping fee not included)</span>
                </div>
                {/* <button className="btn w-full mt-3  text-gray-900 bg-pink-150" disabled={!totalProduct} onClick={() => setTrackingClickOrder(true)}> */}
                <button className="btn w-full mt-3  text-gray-900 bg-pink-150" disabled={true} onClick={() => { }}>
                  Purchase
                  <HeartIcon className='w-4' />
                  {/* <span className="loading loading-spinner w-4"></span> */}
                </button>
              </>
              : <div className="flex flex-col items-center justify-center py-6">
                <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-3" />
                <span>No product in cart</span>
              </div>}
          </div>
        </div>

      </header>

      <div ref={containerRef} className="ae-drop-container mt-20">
        <Countdown />
        <OrderProductList
          productRemove={productRemove}
          resetProductRemove={resetProductRemove}
          trackingClickOrder={trackingClickOrder}
          isDone={isDone}
          onClickOrder={onOpenModalConfirm}
          onChangeProduct={onChangeProduct}
          onChangeTotalProduct={(e: number) => setTotalProduct(e)} />
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
                  <div ref={divRef} className="bg-white max-h-[70vh] overflow-y-auto px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mx-auto flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mb-4">
                        <img className="w-20" src="./logo-circle.svg" />
                      </div>
                      {startCountDown && step === 3 &&
                        <>
                          <CountDownCompleteEn initialMinutes={8 * 60} />
                          <span className="text-mini italic text-red-500 text-left">(Your slot has been reserved! Please complete the payment within 8 hours. If you don’t want to purchase, please click “Cancel”)</span>
                        </>
                      }
                      {step < 4 && <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 flex justify-start">
                          Order confirmed:
                        </Dialog.Title>
                        <div className="mt-2 flex flex-col text-sm text-gray-500">
                          {carts.map((prod, i) => (
                            <div className="flex items-center justify-between" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(x{prod.quantity})</span></span>
                              <span className="font-semibold ms-2">{toDollar(prod.price * prod.quantity)}</span>
                            </div>
                          ))}
                          {soldout.map((prod, i) => (
                            <div className="flex items-center justify-between text-red-600" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(sold out)</span></span>
                            </div>
                          ))}
                          {/* {step === 3 && discount ? <div className="flex items-center justify-between mt-1 italic">
                            <span className="font-semibold ">Discount:</span>
                            <span className="font-semibold ms-2">- {toDollar(discount)}</span>
                          </div> : <></>} */}
                          {step === 3 && <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold">Shipping fee:</span>
                            <span className="font-semibold ms-2">{toDollar(ship)}</span>
                          </div>}

                          <div className="flex items-center justify-between mt-1">
                            {step < 3 &&
                              <>
                                <span className="font-semibold">Total:</span>
                                <span className="font-semibold ms-2">{toDollar(totalPrice)}</span>
                              </>}
                            {step >= 3 &&
                              <>
                                <span className="font-semibold">Total:</span><br />
                                <span className="font-semibold ms-2">{toDollar(totalAmount)}</span>
                              </>}
                          </div>
                          {step < 3 && <span className="text-mini italic text-start" >(shipping fee not included)</span>}

                        </div>

                        {step === 3 ? <div className="flex flex-col">
                          <Dialog.Title as="h3" className="font-semibold leading-6 mt-2 text-gray-500 flex justify-start">
                            {'Payment information'}:
                          </Dialog.Title>
                          {payment == 'ckPayPal' ? <div>
                            <div className="text-sm text-gray-500 font-semibold mt-2">
                              <div className="flex justify-center flex-1">
                                <img className="w-24" src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png" />
                              </div>
                              <div className="flex col  flex-1 ">
                                <span>Total: </span>
                                <span className="text-gray-900 ml-1">{toDollar(totalAmount)}</span>
                              </div>
                              <div className="flex flex-1 items-center mt-3">
                                <span>Username: </span>
                                <div className="flex flex-1 items-center ml-1">
                                  <span className="text-center text-sm text-gray-900 font-semibold">@kiras98</span>
                                  <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={() => copy('@kiras98')} />
                                </div>
                              </div>
                              <div className="flex flex-1 items-center mt-3">
                                <span>Email: </span>
                                <div className="flex flex-1 items-center ml-1">
                                  <span className="text-center text-sm text-gray-900 font-semibold">khanh.nguyendanh.kiras98@gmail.com</span>
                                  <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={() => copy('khanh.nguyendanh.kiras98@gmail.com')} />
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center mt-4">
                              <a href="https://paypal.me/kiras98" target="_blank" className="text-center text-sm text-blue-900 font-semibold">paypal.me/kiras98</a>
                              <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={() => copy('https://paypal.me/kiras98')} />
                            </div>
                          </div>
                            : <div>
                              {/* <span className="text-mini italic text-red-500 text-left">(If you use Remitly, please follow ours informations)</span> */}
                              <div className="text-sm text-gray-500 font-semibold mt-2">
                                <div className="flex justify-center flex-1">
                                  <img className="w-32" src="https://cdn.remitly.com/images/v1/img/remtily_logo_vertical_midnight_b.6eT0nA18TSlQIsjllF72RN.png" />
                                </div>
                                <div className="flex col  flex-1 ">
                                  <span>Total: </span>
                                  <span className="text-gray-900 ml-1">{toDollar(totalAmount)}</span>
                                </div>
                                <div className="flex col  flex-1 mt-3">
                                  <span>Delivery method: </span>
                                  <span className="text-gray-900 ml-1"> Bank deposit</span>
                                </div>
                                <div className="flex col flex-1 items-center mt-2">
                                  <span>Recipient's bank: </span>
                                  <div className="flex items-center rounded-sm border px-1 py-1 ml-1">
                                    <img className="w-12" src="https://dongphucvina.vn/wp-content/uploads/2023/05/logo-techcombank-dongphucvina.vn_.png"></img>
                                    <span className="text-gray-900 ml-1">Techcombank</span>
                                  </div>
                                </div>
                                <div className="flex flex-1 items-center mt-2">
                                  <span>Recipient Bank account: </span>
                                  <div className="flex flex-1 items-center ml-1">
                                    <span className="text-center text-sm text-gray-900 font-semibold">19037257529012</span>
                                    <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={() => copy('19037257529012')} />
                                  </div>
                                </div>
                                <div className="flex flex-1 items-start mt-4">
                                  <span>Recipient name: </span>
                                  <div className="flex flex-col items-start">
                                    <span className="text-gray-900 ml-1">Nguyen - Danh - Khanh</span>
                                    <span className="italic font-normal">(Family - Middle - Given)</span>
                                  </div>
                                </div>
                              </div>
                            </div>}


                          {/* <div className="flex flex-1 items-center justify-center mt-5">
                            <span className="text-center text-sm text-gray-900 font-semibold">19037257529012</span>
                            <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={copy} />
                          </div> */}
                        </div> : <></>}
                      </div>}
                      {step == 2 &&
                        <div className="mt-2 text-center sm:mt-0 sm:text-left">

                          <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 mt-4">
                            Your infomation:
                          </Dialog.Title>
                          <div className="text-gray-800">

                            <input type="text" placeholder="Id IG account" className="ae-input" value={info.ig} onChange={(e) => setInfo({
                              ...info,
                              ig: e.target.value
                            })} />
                            <input type="text" placeholder="Phone number" className="ae-input" value={info.phone} onChange={(e) => setInfoPhone(e.target.value)} />
                            {phoneWarning && <span className="text-mini italic text-start text-red-500" >{phoneWarning}</span>}

                            <input type="text" placeholder="Full name" className="ae-input" value={info.name} onChange={(e) => setInfo({
                              ...info,
                              name: e.target.value
                            })} />

                            <select className="ae-select w-full" value={info.countrySelect} onChange={e => setInfo({ ...info, country: e.target.value, countrySelect: e.target.value })}>
                              <option value='COUNTRY' disabled>Choose your country</option>
                              <option value='The US'>The US</option>
                              <option value='The UK'>The UK</option>
                              <option value='Australia'>Australia</option>
                              <option value='Cambodia'>Cambodia</option>
                              <option value='Canada'>Canada</option>
                              <option value='France'>France</option>
                              <option value='Germany'>Germany</option>
                              <option value='Hongkong'>Hongkong</option>
                              <option value='India'>India</option>
                              <option value='Indonesia'>Indonesia</option>
                              <option value='Italy'>Italy</option>
                              <option value='Japan'>Japan</option>
                              <option value='Laos'>Laos</option>
                              <option value='Malaysia'>Malaysia</option>
                              <option value='Netherland'>Netherland</option>
                              <option value='Norway'>Norway</option>
                              <option value='Philippines'>Philippines</option>
                              <option value='Poland'>Poland</option>
                              <option value='Singapore'>Singapore</option>
                              <option value='South Korea'>South Korea</option>
                              <option value='Sweden'>Sweden</option>
                              <option value='Taiwan'>Taiwan</option>
                              <option value='Thailand'>Thailand</option>
                              {/* <option value=''>Other...</option> */}
                            </select>

                            {/* {!info.countrySelect
                              ? <input type="text" placeholder="Input your country" className="ae-input" value={info.country} onChange={(e) => setInfo({
                                ...info,
                                country: e.target.value
                              })} />
                              : <></>} */}

                            <input type="text" placeholder="State/Province/Region" className="ae-input" value={info.province.name} onChange={(e) => setInfo({
                              ...info,
                              province: {
                                code: "0",
                                name: e.target.value
                              }
                            })} />


                            <div className="flex justify-between w-full">
                              <input type="text" placeholder="City/District" className="ae-input w-[150px]" value={info.district.name} onChange={(e) => setInfo({
                                ...info,
                                district: {
                                  code: "0",
                                  name: e.target.value
                                }
                              })} />
                              <input type="text" placeholder="Ward/Street" className="ae-input w-[150px] ml-2" value={info.ward.name} onChange={(e) => setInfo({
                                ...info,
                                ward: {
                                  code: "0",
                                  name: e.target.value
                                }
                              })} />
                            </div>

                            <textarea placeholder="Detail address" className="ae-textarea mt-4" value={info.address} onChange={(e) => setInfo({
                              ...info,
                              address: e.target.value
                            })} />

                            <input type="text" placeholder="Postal Code" className="ae-input mt-2" style={{ marginTop: '8px', marginBottom: '8px' }} value={info.postal} onChange={(e) => setInfo({
                              ...info,
                              'postal': e.target.value
                            })} />

                            <textarea placeholder="Note" className="ae-textarea mt-2" value={info.note} onChange={(e) => setInfo({
                              ...info,
                              note: e.target.value
                            })} />

                            <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 my-2">
                              Payment method:
                            </Dialog.Title>
                            <div className="flex items-center justify-around">
                              <div className=" flex flex-col">
                                <div className="flex items-center">
                                  <input type="radio" name="radio-1" className="radio me-2" value='ckPayPal' checked={payment === 'ckPayPal'} onChange={e => setPayment('ckPayPal')} />
                                  <span>Paypal</span>
                                </div>
                              </div>
                              <div className=" flex flex-col">
                                <div className="flex items-center ">
                                  <input type="radio" name="radio-1" className="radio me-2" value='ckRemitly' checked={payment === 'ckRemitly'} onChange={e => setPayment('ckRemitly')} />
                                  <span>Remitly</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>}
                      {step === 4 &&
                        <div>
                          <>
                            <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start">
                              🎀 After completing payment, please send us a screenshot of E-invoice via Instagram
                            </Dialog.Title>
                            <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                          </>
                          <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start ">
                            🎀 Order confirmation message will be sent to you via IG within 5 minutes.
                          </Dialog.Title>
                          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                          <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start ">
                            🎀 Thank you for your purchase ❤️
                          </Dialog.Title>
                        </div>
                      }
                    </div>
                    <div ref={bottomRef} />
                  </div>
                  <div className="bg-white px-4 py-3 flex justify-between ">
                    {step < 3 && <button className="btn mx-2 bg-white text-gray-900" onClick={() => {
                      if (step === 1) {
                        setDialogConfirm(false)
                        setSoldout([])
                        if (containerRef.current) {
                          containerRef.current.scrollIntoView()
                        }
                      }
                      setStep(step - 1)
                    }}>
                      Back
                    </button>}
                    {step === 3 && <button className="btn mx-2 bg-white text-gray-900" onClick={() => cancelOrder(cartId)}>
                      Cancel order
                    </button>}
                    {step < 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" disabled={!carts.length} onClick={() => nextStep()}>
                      Continue
                    </button>}
                    {step === 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => nextStep()}>
                      Transferred
                    </button>}
                    {step === 4 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => done()}>
                      Complete
                    </button>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

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
                      You have {orders.length} orders:
                    </Dialog.Title>
                    {orders.map((order, index) => (<div className='mb-6 text-gray-900 mt-2 text-sm' key={order._id}>
                      <div className="text-gray-600 text-sm italic">{moment(order.updateAt).format('DD/MM/YYYY HH:mm')}</div>
                      <div className='flex '>
                        <span className="text-md text-gray-900 font-semibold me-1">Infomation: </span>
                        <span className="text-center text-md text-gray-900">{order.info.name} - {order.info.phone}</span>
                      </div>
                      <div className='flex'>
                        <span className="text-start text-md text-gray-900"><span className="font-semibold">Address: </span>{order.info.address}, {order.info.ward.name}, {order.info.district.name}, {order.info.province.name}</span>
                      </div>
                      {order.info.note
                        ? <div className='flex mb-2'>
                          <span className="text-start text-md text-gray-900"><span className="font-semibold">Note: </span>{order.info.note}</span>
                        </div>
                        : <></>
                      }
                      <span className="text-md text-gray-900 font-semibold me-1 ">Product List: </span>
                      <div>{order.products.map(p => (
                        <div key={order._id + p._id + p.unit}>- {p.name + ' size ' + p.unit + ' '} (x{p.quantity})</div>
                      ))}</div>
                      <div className="font-semibold">Total: {toDollar(order.totalAmount)}
                        {order.statusMessage == 0 && !isMoreThan10Minutes(order.updateAt, new Date().toISOString()) ? <button className='bg-red-500 rounded text-white p-2 ms-8' onClick={() => cancelOrderApi(order._id)}>Cancel order</button> : <></>}
                      </div>
                      <div>----------------------------------------------------</div>
                    </div>))}

                  </div>

                  <div className="bg-white px-4 py-3 flex justify-between ">
                    {orders.length < 2 ? <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => { if (orders.length < 2) setOrders([]) }}>
                      Confirm
                    </button> : <></>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <DialogCancelOrderSuccess visible={dialogCancelOrder} lang={'en'} />

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
