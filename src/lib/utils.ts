export function toCurrency(number = 0) {
  return number
    ? number.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
    : '0 đ';
}