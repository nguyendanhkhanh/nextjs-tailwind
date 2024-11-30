'use client'

import Image from "next/image";
import Countdown from "@/app/order-test-6666/Countdown";
import OrderProductList from "@/app/order-test-6666/OrderProductList";
import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DocumentDuplicateIcon, ExclamationTriangleIcon, ShoppingBagIcon, XCircleIcon, HeartIcon } from '@heroicons/react/24/outline'
import BackgroundModal from "@/components/BackgroundModal";
import { CartRequest, CartType } from "@/interface/Product";
import { calculateShip, generateRandomString, toCurrency, toRounded, toThousand, validatePhone } from "@/lib/utils";
import { isFreeship } from "@/lib/common";
import eventEmitter from '@/lib/eventEmitter';
import axios from "axios";
import { HOST, ISSERVER } from "@/lib/config";
import CountDownComplete from "@/components/CountDownComplete";
import DialogCancelOrderSuccess from "@/components/DialogCancelOrderSuccess";
import moment from 'moment'
import DialogError from "@/components/DialogError";

export default function Home() {

  const divRef = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [isMerge, setIsMerge] = useState(false);

  const [deviceCode, setDeviceCode] = useState('');

  const [loading, setLoading] = useState(false)
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
  const [cartId, setCartId] = useState('')
  const cartIdRef = useRef(cartId);
  const cartsRef = useRef(carts)
  const [productRemove, setProductRemove] = useState(null)
  const [trackingClickOrder, setTrackingClickOrder] = useState(false)


  const [soldout, setSoldout] = useState([])


  const [isDone, setIsDone] = useState(false)


  const [orders, setOrders] = useState<any[]>([])

  const [camiErr, setCamiErr] = useState('')


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
  }, [info.ig, info.phone, info.name, info.address, info.province.code, info.district.code, info.ward.code, info.address])

  useEffect(() => {
    if (info.phone) {
      checkPhone()
    }
    return () => {
    }
  }, [info.phone])

  useEffect(() => {
    window.addEventListener("beforeunload", (ev) => {
      handleOut()
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
      const confirmationMessage = "Bạn có chắc chắn muốn rời khỏi trang này?";
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

  const onOpenCart = (carts: CartType[], totalPrice = 0) => {

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

    const existCami = cartsConvert.find(c => c.name === 'Cami tặng kèm')
    if (existCami && cartsConvert.length === 1) {
      return setCamiErr('Cami chỉ được tặng kèm khi mua cùng sản phẩm khác')
    }

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
    // if (!validatePhone(value)) {
    //   setPhoneWarning('Hãy nhập SĐT đúng')
    //   setDiscountPercent(0)
    // } else {
    //   setPhoneWarning('')
    //   const res = await axios.get(HOST + '/api/customer?phone=' + value)
    //   if (res.data.data) {
    //     setDiscountPercent(res.data.data.discount)
    //   } else {
    //     setDiscountPercent(0)
    //   }
    // }
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
      // const districtList: any[] = []
      // p.children.forEach((it: string) => {
      //   const dist = addressAll.districts[it]
      //   districtList.push({
      //     ...dist,
      //     code: it
      //   })
      // })
      // setDistricts(districtList)
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
    // const wardList: any[] = []
    // d.children.forEach((it: string) => {
    //   const w = addressAll.wards[it]
    //   wardList.push({
    //     ...w,
    //     code: it
    //   })
    // })
    // setWards(wardList)
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
      // if (bottomRef.current) {
      //   bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      // }
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
      let depositValue = 0
      if (payment === 'cod' && totalPrice >= 500000) {
        depositValue = toRounded(totalPrice * 0.2)
        console.log("🚀 ~ nextStep ~ depositValue:", depositValue)
      }
      setDeposite(depositValue)
      const totalAmountValue = totalPriceAfterDiscount + shipValue
      setTotalAmount(totalAmountValue)
      const totalPaymentValue = totalAmountValue - depositValue
      setTotalPayment(totalPaymentValue)

      const bankValue = payment === 'ck' ? totalPaymentValue : depositValue

      if (bankValue) {
        const url = `https://api.vietqr.io/image/970407-19037257529012-Dgrd4Uv.jpg?accountName=NGUYEN%20DANH%20KHANH&amount=${toRounded(bankValue)}&addInfo=${info.phone}%20${payment === 'ck' ? 'CK%20full' : 'Coc%2020'}`
        setUrlQr(url)
      }

      submitOrder(shipValue, depositValue)
    }

    if (step === 3) {
      // calculateOrder()
      customerCompleteOrder()
      setStep(step + 1)
    }

  }

  const submitOrder = async (shipValue: number, depositValue: number) => {
    // eventEmitter.emit('reloadProducts')

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
      var timeoutCancel = setTimeout(() => {
        cancelOrder(resp.cartId)
      }, 5 * 60 * 1000);
      // }, 10 * 1000);
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

  const calculateOrder = async () => {
    await axios.post(HOST + '/api/order/calculate', {
      carts: carts,
      info: info,
      deviceCode: deviceCode,
      cartId: cartId,
      payment: payment,
    })
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

  const copy = () => {
    const el = document.createElement("textarea");
    el.value = '19037257529012';
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
    <main className="min-h-screen min-w-[375px] max-w-screen-xl bg-gradient-to-t from-[#fbecef] to bg-pink-50 flex flex-col justify-between">
      <header className="bg-pink-50 z-50 fixed top-0 min-w-full max-w-screen-xl flex justify-between items-center px-4 py-3 text-gray-900">
        <div className="cursor-pointer" onClick={() => {
          window.location.href = 'https://amandaera.com/en';
        }}>
          <div className="flex align-center font-semibold">
            <img className="w-8" src="./vietnam.png" />
            <span className="mt-1 ms-1">VI</span>
          </div>
          {/* <img className="w-8" src="./vietnam.png" /> */}
        </div>
        <img className="w-40" src="./logo-square.png" />
        <div className="dropdown dropdown-end">
          {/* <div  role="button" className="btn btn-ghost rounded-btn">Dropdown</div> */}
          <div tabIndex={0} role="button" className="relative mb-1 cursor-pointer">
            <ShoppingBagIcon className="h-6 w-6 gray-900" />
            <div className="bg-red-500 w-4 h-4 flex items-center justify-center rounded-full text-mini text-white absolute top-4 left-3">{totalProduct}</div>
          </div>

          <div tabIndex={0} className="menu dropdown-content bg-white z-[1]  mt-4 w-80 pr-2 shadow text-center min-h-64">
            <span className="text-xl font-semibold mb-2">GIỎ HÀNG</span>
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
                            <span className="font-medium ">{toThousand(prod.price * prod.quantity)}</span>
                          </div>
                        </div>
                        <XCircleIcon className="h-6 w-6 gray-900 cursor-pointer" onClick={() => onRemoveProductInCart(prod)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex  justify-between mt-4 px-1 text-md">
                  <span className="">Tổng tiền:</span>
                  <span className="font-semibold ms-2">{toThousand(totalPrice)}</span>
                </div>
                <div className="flex  justify-between px-1 text-md">
                  <span className="text-mini italic text-start">(chưa gồm phí ship)</span>
                </div>
                {/* <button className="btn w-full mt-3  text-gray-900 bg-pink-150" disabled={!totalProduct} onClick={() => setTrackingClickOrder(true)}> */}
                <button className="btn w-full mt-3  text-gray-900 bg-pink-150" disabled={true} onClick={() => { }}>
                  Đặt hàng
                  <HeartIcon className='w-4' />
                  {/* <span className="loading loading-spinner w-4"></span> */}
                </button>
              </>
              : <div className="flex flex-col items-center justify-center py-6">
                <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-3" />
                <span>Chưa có sản phẩm trong giỏ hàng</span>
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
                          <CountDownComplete initialMinutes={5} />
                          <span className="text-mini italic text-red-500 text-left">(Slot của nàng đã được giữ. Vui lòng hoàn tất bước này trong vòng 5 phút. Nếu không muốn tiếp tục, vui lòng bấm Hủy đơn)</span>
                        </>
                      }
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
                          {soldout.map((prod, i) => (
                            <div className="flex items-center justify-between text-red-600" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(sold out)</span></span>
                            </div>
                          ))}
                          {step === 3 && discount ? <div className="flex items-center justify-between mt-1 italic">
                            <span className="font-semibold ">Giảm giá:</span>
                            <span className="font-semibold ms-2">- {toThousand(discount)}</span>
                          </div> : <></>}
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
                                <span className="font-semibold ms-2">{toThousand(totalAmount)}</span>
                              </>}
                          </div>
                          {step < 3 && <span className="text-mini italic text-start" >{isFreeship(totalPrice) ? '(freeship với đơn trên 800k)' : '(chưa gồm phí ship)'}</span>}

                          {/* {totalPrice >= 500000 &&
                            <>
                              <div className="flex justify-between items-center">
                                <span className="font-semibold mt-1">Quà tặng kèm:</span>
                                {step < 3 && <select className="select select-sm rounded-sm  w-52" value={""} onChange={e => setInfo({ ...info, gift: e.target.value })}>
                                  <option value={'Kẹp tóc hoa lan ngẫu nhiên'} disabled>Kẹp tóc hoa lan ngẫu nhiên</option>
                                  <option value='Kẹp tóc hoa lan tím pastel'>Kẹp tóc tím pastel</option>
                                  <option value='Kẹp tóc hoa lan màu hồng pastel'>Kẹp tóc hồng pastel</option>
                                  <option value='Kẹp tóc hoa lan màu xanh pastel'>Kẹp tóc xanh pastel</option>
                                  <option value='Kẹp tóc hoa lan màu hồng'>Kẹp tóc hồng</option>
                                  <option value='Kẹp tóc hoa lan màu trắng'>Kẹp tóc trắng</option>
                                </select>}
                                {step < 3 &&
                                  <span className="mt-1">Kẹp tóc hoa lan ngẫu nhiên</span>
                                }
                                {step === 3 && <span className="mt-1">Kẹp tóc hoa lan ngẫu nhiên</span>}
                              </div>
                              {step < 3 && <span className="text-mini italic text-start" >(tặng kèm với đơn trên 500k)</span>}
                            </>} */}
                          {step === 3 && deposite ?
                            <>
                              <div className="flex items-center justify-between mt-1  text-warning">
                                <span className="font-semibold">Cọc 20%:</span>
                                <span className="font-semibold ms-2">{toThousand(deposite)}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-success">
                                <span className="font-semibold">Tổng tiền thanh toán COD:</span>
                                <span className="font-semibold ms-2">{toThousand(totalPayment)}</span>
                              </div>
                            </>
                            : <></>
                          }

                          {/* <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span> */}
                        </div>

                        {step === 3 && (payment === 'ck' || deposite) ? <div className="flex flex-col">
                          <Dialog.Title as="h3" className="font-semibold leading-6 mt-2 text-gray-500 flex justify-start">
                            {deposite ? 'Thông tin chuyển khoản cọc' : 'Thông tin chuyển khoản'}:
                          </Dialog.Title>
                          <span className="text-mini italic text-red-500 text-left">(Quét mã QR dưới để ck, sau khi ck babi nhớ chụp màn hình r gửi qua IG cho Amanda nha)</span>
                          <img src={urlQr}
                          />
                          <div className="flex flex-1 items-center justify-center -mt-5">
                            <span className="text-center text-sm text-gray-900 font-semibold">19037257529012</span>
                            <DocumentDuplicateIcon className=" ms-1 h-5 w-5 text-gray-900 cursor-pointer" onClick={copy} />

                          </div>
                        </div> : <></>}
                      </div>}
                      {step == 2 &&
                        <div className="mt-2 text-center sm:mt-0 sm:text-left">

                          <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 mt-4">
                            Thông tin của nàng:
                          </Dialog.Title>
                          <div className="text-gray-800">

                            <input type="text" placeholder="Id tài khoản IG (nhớ điền đúng nha)" className="ae-input" value={info.ig} onChange={(e) => setInfo({
                              ...info,
                              ig: e.target.value
                            })} />
                            <input type="text" placeholder="Số điện thoại" className="ae-input" value={info.phone} onChange={(e) => setInfoPhone(e.target.value)} />
                            {discountPercent ? <span className="text-mini italic text-start text-green-600" >(được giảm {discountPercent}% feedback)</span> : <span></span>}
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
                                  <input type="radio" name="radio-1" className="radio me-2" value='cod' checked={payment === 'cod'} onChange={e => setPayment('cod')} />
                                  <span>COD</span>
                                </div>
                                {info.province.code && !isFreeship(totalPrice) && <span className="text-mini italic text-start ms-3" >(phí ship {toThousand(calculateShip(info.province.code, 'cod', totalPrice))})</span>}
                              </div>
                            </div>

                            <div className=" flex flex-col text-gray-600 my-4">
                              <Dialog.Title as="h3" className="font-semibold leading-6 text-gray-500 flex justify-start">
                                Tích vào ô dưới đây nếu là đơn hàng thứ 2 và gộp đơn (nếu k bỏ qua)
                              </Dialog.Title>
                              <label className="label flex justify-start cursor-pointer pb-0">
                                <input type="checkbox" checked={isMerge} className="checkbox checkbox-sm checkbox-primary" onChange={e => setIsMerge(e.target.checked)} />
                                <span className="text-base ms-2">Đơn thứ 2 + gộp đơn</span>
                              </label>
                              <span className="text-mini italic text-start"  >(Phí ship được tính lại khi gửi tin nhắn xác nhận!)</span>
                            </div>

                          </div>
                        </div>}
                      {step === 4 &&
                        <div>
                          {(payment === 'ck' || deposite) ? <>
                            <Dialog.Title as="h3" className=" leading-6 text-gray-900 flex justify-start">
                              🎀 Sau khi hoàn tất chuyển khoản trong vòng 5 phút, nàng vui lòng chụp màn hình chuyển khoản thành công gửi cho Amanda nha
                            </Dialog.Title>
                            <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
                          </> : <></>
                          }
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
                    <div ref={bottomRef} />
                  </div>

                  {/* <div className="text-sm font-semibold text-gray-900">
                    Sản phẩm đã hết:
                    {soldout.map(p => (<div>{p.name}</div>))}
                  </div> */}

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
                      Quay lại
                    </button>}
                    {step === 3 && <button className="btn mx-2 bg-white text-gray-900" onClick={() => cancelOrder(cartId)}>
                      Hủy đơn
                    </button>}
                    {step < 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" disabled={!carts.length} onClick={() => nextStep()}>
                      Tiếp tục
                    </button>}
                    {step === 3 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => nextStep()}>
                      {(payment === 'ck' || deposite) ? 'Đã chuyển khoản' : 'Xác nhận'}
                    </button>}
                    {step === 4 && <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => done()}>
                      Hoàn tất
                    </button>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={orders.length ? false : false} as={Fragment}>
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
                        <div key={order._id + p._id + p.unit}>- {p.name + ' size ' + p.unit + ' '} (x{p.quantity})</div>
                      ))}</div>
                      <div className="font-semibold">Tổng tiền: {toThousand(order.totalAmount)} - {order.payment === 'cod' ? 'COD' : 'Chuyển khoản'}
                        {order.statusMessage == 0 && !isMoreThan10Minutes(order.updateAt, new Date().toISOString()) ? <button className='bg-red-500 rounded text-white p-2 ms-8' onClick={() => cancelOrderApi(order._id)}>Hủy đơn</button> : <></>}
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
      <DialogError visible={camiErr ? true : false} content={camiErr} onClose={() => setCamiErr('')}  />

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
