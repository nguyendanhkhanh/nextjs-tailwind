export function isFreeship(totalPrice = 0) {
  if (totalPrice >= 800000) {
    return true
  } else {
    return false
  }
}