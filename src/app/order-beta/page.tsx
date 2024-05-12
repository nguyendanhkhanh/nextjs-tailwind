'use client'

import { toCurrency, toThousand } from '@/lib/utils'
import { HeartIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { mkConfig, generateCsv, download } from "export-to-csv";
import { HOST } from '@/lib/config'
const csvConfig = mkConfig({ useKeysAsHeaders: true });

export default function OrderBeta() {

  const [products, setProducts] = useState<any[]>([])
  const [productList, setProductList] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [lastTotal, setLastTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [feeShip, setFeeShip] = useState(0)
  const [gift, setGift] = useState('')
  const [errorGift, setErrorGift] = useState(false)
  const [ship, setShip] = useState('')
  const [success, setSuccess] = useState('')
  const [successContent, setSuccessContent] = useState('')
  const [cod, setCod] = useState(0)
  const [info, setInfo] = useState({
    ig: '',
    phone: '',
    name: '',
    address: ''
  })

  const onSuccess = (caseType: string) => {
    switch (caseType) {
      case 'cod': {
        setSuccessContent(`Sốp xác nhận thông tin chuyển khoản thành công. Cảm ơn nàng đã mua hàng tại Amanda Era ạ❤️`)
        setCod(Math.round(lastTotal))
        break;
      }
      case 'coc50': {
        setSuccessContent(`Sốp xác nhận đã nhận cọc, số tiền ${toThousand(lastTotal - 50000)} còn lại sẽ thanh toán cod sau khi nhận hàng. Cảm ơn nàng đã mua hàng tại Amanda Era ạ❤️`)
        setCod(Math.round(lastTotal - 50000))
        break;
      }
      case 'ck': {
        setSuccessContent(`Sốp xác nhận thông tin chuyển khoản thành công. Cảm ơn nàng đã mua hàng tại Amanda Era ạ❤️`)
        setCod(0)
        break;
      }
    }
  }

  const onSubmit = async () => {
    const productData = productList.map(p => ({
      _id: p._id,
      code: p.code,
      quantity: p.quantity
    }))
    console.log("🚀 ~ productData ~ productData:", productData)

    if (gift) {
      const prod = products.find(p => p.name === gift)
      if (!prod) return setErrorGift(true)
      productData.push({
        _id: prod._id,
        code: '',
        quantity: 1
      })
    }

    await axios.post(HOST + '/api/order-beta', {
      products: productData,
      ig: info.ig,
      name: info.name,
      address: info.address,
      cod: cod
    })
  }

  const getProduct = async () => {
    const res = await axios.get(HOST + '/api/product-beta?drop=4')
    console.log(res.data.data);

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

  // const getOrder = async () => {
  //   const res = await axios.get(HOST + 'api/order-beta')
  //   const data = res.data.data.map(o => {
  //     return {
  //       ...o,
  //       products: JSON.stringify(o.products.map(p => p.nameOrder))
  //     }
  //   })

  //   const csv = generateCsv(csvConfig)(data);

  //   download(csvConfig)(csv)

  //   console.table(data);

  // }

  function onAdd(i: number, unitCode: string) {
    const unit = products[i].units.find((u: any) => u.code === unitCode)
    if (unit) {
      unit.buy += 1
      setProducts(JSON.parse(JSON.stringify(products)))
    }
  }

  function onSubtract(i: number, unitCode: string) {
    const unit = products[i].units.find((u: any) => u.code === unitCode)
    if (unit) {
      unit.buy -= 1
      setProducts(JSON.parse(JSON.stringify(products)))
    }
  }

  function onChangeUnitQty(e: any, unitCode: string) {
  }

  function onClickOrder(discountPercent: number) {
    setDiscount(discountPercent)
    let totalProduct = 0
    let totalPriceProduct = 0
    const productList: any[] = []
    products.forEach(prod => {
      prod.units.forEach((unit: any) => {
        totalProduct += unit.buy
        totalPriceProduct += unit.buy * prod.price
        if (unit.buy) {
          productList.push({
            _id: prod._id,
            code: unit.code,
            quantity: unit.buy,
            name: prod.name,
            price: prod.price
          })
        }
      })
    })

    setTotalValue(totalPriceProduct)

    let totalPriceAfterDiscount = totalPriceProduct
    if (discountPercent) {
      totalPriceAfterDiscount = totalPriceAfterDiscount * (1 - discountPercent / 100)
      console.log("🚀 ~ onClickOrder ~ totalPriceAfterDiscount:", totalPriceAfterDiscount)
    }
    setTotalPrice(totalPriceAfterDiscount)

    let shipFee = 0
    if (ship === 'hn1' || ship === 'hn') {
      shipFee = 16000
    } else if (ship === 'hn2') {
      shipFee = 22000
    } else {
      shipFee = 30000
    }
    if (totalPriceProduct >= 800000) {
      shipFee = 0
    }
    setFeeShip(shipFee)
    setLastTotal(totalPriceAfterDiscount + shipFee)

    console.log(productList);
    setProductList(productList)
    // setTotalPrice(totalPrice)
    // const pro

    // const content = `Amanda xác nhận đơn hàng của nàng gồm có: \n \n ${}`

    if (totalPrice > 550) {

    }

    // setTotalProduct(totalProduct)
    // setTotalPrice(totalPrice)
  }

  useEffect(() => {
    getProduct()
    // getOrder()
    return () => {
    }
  }, [])

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 p-24">
        {products.map((p, i) => (
          <div key={i} className='flex my-8'>
            <img className='w-[150px] me-4' src={p.image} />
            <div className='flex flex-col justify-between'>
              <div>{p.name}
                {p.units.map((u: any) => (
                  <div key={u.code} className='flex justify-between items-center' >
                    <span className='me-3'>Size {u.code}</span>
                    <div className='flex items-center'>
                      <button className="btn btn-square btn-xs" onClick={() => onSubtract(i, u.code)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>

                      </button>
                      <input type="text" placeholder="SL" className="input input-ghost input-sm rounded-sm w-10 mx-1 text-center" value={u.buy} onChange={(e) => onChangeUnitQty(e, u.code)} />
                      <button className="btn btn-square btn-xs" onClick={() => onAdd(i, u.code)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>

                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>Còn
                {p.units.map((u: any) => (<div key={u.code}>Size {u.code}: {u.quantity}</div>))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='flex px-24'>
        <input type="text" placeholder="Ship HN" className="input input-sm rounded-sm w-40 mx-1 text-center" value={ship} onChange={(e) => setShip(e.target.value)} />
        <button className="btn my-2" onClick={() => onClickOrder(5)}>
          Đặt hàng 5%
          <HeartIcon className='w-4' />
          {/* <span className="loading loading-spinner w-4"></span> */}
        </button>
        <button className="btn ms-4 my-2" onClick={() => onClickOrder(0)}>
          Đặt hàng
          <HeartIcon className='w-4' />
          {/* <span className="loading loading-spinner w-4"></span> */}
        </button>
      </div>
      {totalPrice &&
        <div className='fixed p-10 top-[10%] left-[25%] bg-white w-[50vw] text-black'>
          <XMarkIcon className='w-10 cursor-pointer' onClick={() => setTotalPrice(0)} />
          Amanda xác nhận đơn hàng của nàng gồm có: <br />
          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
          <div className="mt-2 flex flex-col text-sm text-gray-500">
            {productList.map((prod, i) => (
              <div className="flex items-center justify-between" key={i}>
                <span >{prod.name + ' size ' + prod.code + ' '}<span className="font-semibold">(x{prod.quantity}): {toThousand(prod.price * prod.quantity)}</span></span>
              </div>
            ))}
            <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
            <div>Phí ship: {toThousand(feeShip)}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-semibold">Tổng tiền: {toThousand(lastTotal)} {discount ? '(đã bao gồm giảm 5% feedback)' : ''}</span>
            </div>
            <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
            {totalValue > 550000 && <div>Đơn hàng được tặng kèm một kẹp tóc hoa lan. Nàng ưng màu nào để shop gửi tặng ạ.</div>}
            <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>
            <div>Nàng chọn hình thức thanh toán chuyển khoản hay COD ạ.</div>

            {/* {totalValue > 650000 && <div>Với đơn hàng có giá trị sản phẩm trên 650k, nàng vui lòng cọc chuyển khoản trước 50k giùm shop nha.</div>} */}
          </div>
          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>

          <div>
            <input type="text" placeholder="Tặng kèm" className="input input-sm rounded-sm w-[300px] mx-1 text-center" value={gift} onChange={(e) => setGift(e.target.value)} />
            {errorGift && <ExclamationCircleIcon className='w-10' />}
            <div>
              {totalValue > 650000
                ? <button className="btn my-2" onClick={() => onSuccess('coc50')}>
                  Cọc 50k
                  <HeartIcon className='w-4' />
                  {/* <span className="loading loading-spinner w-4"></span> */}
                </button>
                : <button className="btn ms-4 my-2" onClick={() => onSuccess('cod')}>
                  COD
                  <HeartIcon className='w-4' />
                  {/* <span className="loading loading-spinner w-4"></span> */}
                </button>}
              <button className="btn my-2" onClick={() => onSuccess('coc50')}>
                Cọc 50k
                <HeartIcon className='w-4' />
                {/* <span className="loading loading-spinner w-4"></span> */}
              </button>
              <button className="btn ms-4 my-2" onClick={() => onSuccess('cod')}>
                COD
                <HeartIcon className='w-4' />
                {/* <span className="loading loading-spinner w-4"></span> */}
              </button>
              <button className="btn ms-4 my-2" onClick={() => onSuccess('ck')}>
                CK full
                <HeartIcon className='w-4' />
                {/* <span className="loading loading-spinner w-4"></span> */}
              </button>
            </div>

          </div>

          <div>{successContent}</div>

          <span style={{ "whiteSpace": "pre-wrap" }}>{`\n`}</span>

          <div>
            <input type="text" placeholder="IG" className="input mt-4 input-sm rounded-sm w-[300px] mx-1 text-center" value={info.ig} onChange={(e) => setInfo({
              ...info,
              ig: e.target.value
            })} />
            <input type="text" placeholder="Phone" className="input mt-4 input-sm rounded-sm w-[300px] mx-1 text-center" value={info.phone} onChange={(e) => setInfo({
              ...info,
              phone: e.target.value
            })} />
            <input type="text" placeholder="Name" className="input mt-4 input-sm rounded-sm w-[300px] mx-1 text-center" value={info.name} onChange={(e) => setInfo({
              ...info,
              name: e.target.value
            })} />
            <input type="text" placeholder="address" className="input mt-4 rounded-sm w-[300px] mx-1 text-center" value={info.address} onChange={(e) => setInfo({
              ...info,
              address: e.target.value
            })} />
          </div>

          <button className="btn mt-4 w-[100%] my-2" onClick={() => onSubmit()}>
            Submit
            <HeartIcon className='w-4' />
            {/* <span className="loading loading-spinner w-4"></span> */}
          </button>

        </div>}
    </div >

  );
}
