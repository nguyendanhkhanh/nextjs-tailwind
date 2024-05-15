export function toCurrency(number = 0) {
  return number
    ? number.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
    : '0 đ';
}

export function toThousand(number = 0) {
  return Math.round(number / 1000) + 'k'
}

export function toRounded(number = 0) {
  return Math.round(number / 1000) * 1000
}
export function validatePhone(phone: string) {
  const phoneRegex = /^(0|\+84)\d{9}$/
  return phoneRegex.test(phone)
}

export const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


export function calculateShip(proviceCode: string, payment: string, totalPrice = 0) {
  if (totalPrice >= 800000) return 0
  switch (payment) {
    case 'cod': {
      if (proviceCode === '01') {
        return 22000
      } else if (proviceCode === '79' || proviceCode === '48') {
        return 30000
      } else if (['10', '15', '12', '11', '14', '17', '02', '08', '25', '19',
        '06',
        '04', '20', '24', '22', '31', '26', '27', '33', '30', '24', '36', '37', '35',
      ].includes(proviceCode)) {
        return 30000
      } else {
        return 35000
      }
    }
    case 'ck': {
      if (proviceCode === '01') {
        return 12000
      } else if (proviceCode === '79' || proviceCode === '48') {
        return 16000
      } else if (['10', '15', '12', '11', '14', '17', '02', '08', '25', '19',
        '06',
        '04', '20', '24', '22', '31', '26', '27', '33', '30', '24', '36', '37', '35',
      ].includes(proviceCode)) {
        return 16000
      } else {
        return 20000
      }
    }
    default: return 15000

  }
}