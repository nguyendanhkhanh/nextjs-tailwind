import { CartType } from '@/interface/Product';
import eventEmitter from '@/lib/eventEmitter';
import { toCurrency } from '@/lib/utils';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import React, { useEffect } from 'react'

interface ProductOrderProps {
  product: CartType;
  onChangeQuantity: (id: string, unitCode: string, quantity: number) => void;
  onUpdateQuantity: (id: string, unitCode: string, type: string, value?: number) => void
}


function ProductOrder(props: ProductOrderProps) {


  useEffect(() => {
    eventEmitter.on('warning' + product._id, warning)
    return () => {
      eventEmitter.off('warning', warning)
    }
  }, [])

  const { product, onChangeQuantity, onUpdateQuantity } = props

  function onAdd(unitCode: string) {
    const unit = product.units.find(u => u.code === unitCode)
    if (unit) {
      const qty = unit.quantity + 1
      onChangeQuantity(product._id, unit.code, qty)
    }
  }

  function onSubtract(unitCode: string) {
    const unit = product.units.find(u => u.code === unitCode)
    if (unit) {
      const qty = unit.quantity - 1
      onChangeQuantity(product._id, unit.code, qty)
    }
  }

  function onChangeUnitQty(e: any, unitCode: string) {
    let qty = Number(e.target.value || 0)
    if (qty < 0) qty = 0
    if (qty > 2) qty = 2
    // onUpdateQuantity(product._id, unitCode, 'type', qty)
    return
  }
  function warning(id: string) {
    console.log("🚀 ~ warning ~ id:", id)
    // Tạo một phần tử mới
    var textElement = document.createElement('div');
    textElement.className = 'hiddenText';
    textElement.textContent = 'Quá số lượng cho phép';

    // Thêm phần tử vào container
    var container = document.getElementById(id);
    container.appendChild(textElement);

    // Cho phần tử hiện ra từ dưới lên
    setTimeout(function () {
      textElement.classList.add('visibleText');
    }, 10);

    // Bắt đầu hiệu ứng mờ dần sau 1 giây
    setTimeout(function () {
      textElement.classList.add('fadingText');
      // Xóa phần tử khỏi DOM sau khi hiệu ứng mờ dần kết thúc
      setTimeout(function () {
        container.removeChild(textElement);
      }, 500); // Phải khớp với thời gian transition của opacity trong CSS
    }, 1000);
  }


  return (
    <div>
      <div className='text-center group mb-2'>
        <img className='w-48 h-64 object-cover rounded-t-xl' src={product.image} />
        <div className='flex flex-col w-full bg-white group-hover:opacity-100 rounded-b-xl'>
          <span className='text-xs font-normal'>{product.name}</span>
          <span className='text-xs font-semibold'>{toCurrency(product.price)}</span>
        </div>
      </div>
      {product.units.map((u, idx) => (
        <div id={product._id + u.code} className='flex justify-between items-center relative overflow-hidden h-[30px]' key={u.code}>
          <span>{u.code ? 'Size' : 'SL'} {u.code}</span>
          {u.status !== 'soldout'
            ? <div className='flex items-center'>
              <button className="btn btn-square btn-xs" onClick={() => onUpdateQuantity(product._id, u.code, 'subtract')}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                </svg>

              </button>
              <input type="text" placeholder="SL" readOnly className="input input-ghost input-sm rounded-sm w-10 mx-1 text-center" value={u.quantity} onChange={(e) => onChangeUnitQty(e, u.code)} />
              <button className="btn btn-square btn-xs" onClick={() => {
                onUpdateQuantity(product._id, u.code, 'add')
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>

              </button>
            </div>
            : <div className='me-4 text-gray-600'>SOLD OUT</div>}
        </div>
      ))}

    </div>
  )
}

export default ProductOrder