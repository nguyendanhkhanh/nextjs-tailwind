'use client'

import Image from "next/image";
import Countdown from "@/app/order/Countdown";
import OrderProductList from "@/app/order/OrderProductList";
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import BackgroundModal from "@/components/BackgroundModal";
import { CartRequest, CartType } from "@/interface/Product";
import { toCurrency } from "@/lib/utils";

export default function Home() {

  const [loading, setLoading] = useState(false)
  const [dialogConfirm, setDialogConfirm] = useState(false)
  const [carts, setCarts] = useState<any[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const cancelButtonRef = useRef(null)

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

          <div className="fixed top-36 z-10 w-screen overflow-y-auto">
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
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 ">
                        <img className="w-24" src="./logo-circle.svg" />
                      </div>
                      <div className="mt-2 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Đơn hàng của nàng gồm có
                        </Dialog.Title>
                        <div className="mt-2 flex flex-col text-sm text-gray-500">
                          {carts.map((prod, i) => (
                            <div className="flex items-center justify-between" key={i}>
                              <span >{prod.name + ' size ' + prod.unit + ' '}<span className="font-semibold">(x{prod.quantity})</span></span>
                              <span className="font-semibold ms-2">{toCurrency(prod.price * prod.quantity)}</span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold">Tổng tiền:</span>
                            <span className="font-semibold ms-2">{toCurrency(totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button className="btn w-full bg-pink-300" onClick={() => setDialogConfirm(false)}>
                      Tiếp tục
                    </button>
                    <button className="btn w-full mt-2 bg-pink-100" onClick={() => setDialogConfirm(false)}>
                      Coi thêm
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
