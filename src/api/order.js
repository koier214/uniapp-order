// 订单模块API
import { get, post, put } from '../utils/request.js'

// 创建订单
export function createOrder(items, remark = '', tableNumber = '') {
  return post('/order/create', {
    items,
    remark,
    tableNumber
  })
}

// 获取订单列表
export function getOrderList(type = 'all') {
  return get('/order/list', {
    type
  })
}

// 获取订单详情
export function getOrderDetail(orderId) {
  return get(`/order/detail/${orderId}`)
}

// 取消订单
export function cancelOrder(orderId) {
  return put(`/order/cancel/${orderId}`)
}

// 催单
export function remindOrder(orderId) {
  return post(`/order/remind/${orderId}`)
}
