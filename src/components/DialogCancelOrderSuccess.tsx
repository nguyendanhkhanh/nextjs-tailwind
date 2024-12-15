import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'
import BackgroundModal from "@/components/BackgroundModal";

const DialogCancelOrderSuccess = (props: any) => {

  const { visible, lang } = props
  const cancelButtonRef = useRef(null)
  const divRef = useRef(null);

  return (
    <Transition.Root show={visible} as={Fragment}>
      <Dialog as="div" className="z-10" initialFocus={cancelButtonRef} onClose={() => { }}>
        <BackgroundModal />

        <div className="fixed top-[12vh] z-10 w-screen  overflow-y-auto">
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
                  <div className="mx-auto flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mb-4">
                    <img className="w-20" src="./logo-circle.svg" />
                  </div>
                  <Dialog.Title as="h3" className="leading-6 font-semibold text-md text-gray-500 flex justify-start">
                    {lang === 'en' ? 'Order canceled❤️ ' : 'Đơn hàng đã được huỷ thành công ❤️'}
                  </Dialog.Title>

                </div>

                <div className="bg-white px-4 py-3 flex justify-between ">
                  <button className="btn flex-1 bg-pink-100 text-gray-900" onClick={() => {
                    location.reload()
                  }}>
                    {lang === 'en' ? 'Confirm' : 'Đồng ý'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
export default DialogCancelOrderSuccess