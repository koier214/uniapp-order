// 购物车模块API
import { get, post, put, del } from '../utils/request.js'

// 获取购物车列表
export function getCartList() {
  return get('/cart/list')
}

// 添加商品到购物车
export function addToCart(foodId, spec, quantity) {
  return post('/cart/add', {
    foodId,
    spec,
    quantity
  })
}

// 更新购物车商品数量
export function updateCartItem(cartId, quantity) {
  return put(`/cart/update/${cartId}`, {
    quantity
  })
}

// 删除购物车商品
export function removeCartItem(cartId) {
  return del(`/cart/remove/${cartId}`)
}

// 清空购物车
export function clearCart() {
  return del('/cart/clear')
}
