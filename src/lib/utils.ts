export function toCurrency(number = 0, lang = 'vi') {
  return number
    ? lang === 'vi' ? number.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }) : number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
    : lang === 'vi' ? '0 đ' : '$0';
}

export function toThousand(number = 0) {
  return Math.round(number / 1000) + 'k'
}

export function toDollar(number = 0) {
  return '$' + number
}

export function dollarToVnd(number = 0) {
  return number * 25500
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


export function calculateShip(proviceCode: string, payment: string, totalPrice = 0, shipOption = 'all') {
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
      let fee = 15000
      if (proviceCode === '01') {
        fee = 12000
      } else if (proviceCode === '79' || proviceCode === '48') {
        fee = 16000
      } else if (['10', '15', '12', '11', '14', '17', '02', '08', '25', '19',
        '06',
        '04', '20', '24', '22', '31', '26', '27', '33', '30', '24', '36', '37', '35',
      ].includes(proviceCode)) {
        fee = 16000
      } else {
        fee = 20000
      }
      return shipOption === 'all' ? fee : fee * 2
    }
    default: return 15000

  }
}

export function calculateShipWorld(country: string) {
  switch (country) {
    case 'Australia': { return 22 }
    case 'Cambodia': { return 34 }
    case 'Canada': { return 33 }
    case 'France': { return 33 }
    case 'Germany': { return 30 }
    case 'Hongkong': { return 20 }
    case 'India': { return 35 }
    case 'Indonesia': { return 33 }
    case 'Italy': { return 35 }
    case 'Japan': { return 35 }
    case 'Laos': { return 38 }
    case 'Malaysia': { return 20 }
    case 'Netherland': { return 32 }
    case 'Norway': { return 80 }
    case 'Philippines': { return 21 }
    case 'Poland': { return 33 }
    case 'Singapore': { return 25 }
    case 'South Korea': { return 20 }
    case 'Sweden': { return 45 }
    case 'Taiwan': { return 20 }
    case 'Thailand': { return 32 }
    case 'The UK': {
      return 32
    }
    case 'The US': {
      return 35
    }
    default: return 35

  }
}