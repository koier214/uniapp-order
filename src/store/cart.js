// 购物车 store
export default {
  // 从本地存储获取购物车数据
  getCart() {
    try {
      const cart = uni.getStorageSync('cartList')
      return cart || []
    } catch (e) {
      console.error('获取购物车失败', e)
      return []
    }
  },

  // 保存购物车到本地存储
  saveCart(cartList) {
    try {
      uni.setStorageSync('cartList', cartList)
    } catch (e) {
      console.error('保存购物车失败', e)
    }
  },

  // 添加商品到购物车
  addItem(item) {
    const cartList = this.getCart()
    const existingIndex = cartList.findIndex(i => i.name === item.name)
    
    if (existingIndex > -1) {
      cartList[existingIndex].quantity++
    } else {
      cartList.push({ ...item, quantity: 1 })
    }
    
    this.saveCart(cartList)
    return cartList
  },

  // 添加商品到购物车（指定数量）
  addItemWithQuantity(item, quantity) {
    const cartList = this.getCart()
    const existingIndex = cartList.findIndex(i => i.name === item.name)
    
    if (existingIndex > -1) {
      cartList[existingIndex].quantity += quantity
    } else {
      cartList.push({ ...item, quantity: quantity })
    }
    
    this.saveCart(cartList)
    return cartList
  },

  // 减少商品数量
  decreaseItem(index) {
    const cartList = this.getCart()
    if (cartList[index]) {
      if (cartList[index].quantity > 1) {
        cartList[index].quantity--
      } else {
        cartList.splice(index, 1)
      }
      this.saveCart(cartList)
    }
    return cartList
  },

  // 增加商品数量
  increaseItem(index) {
    const cartList = this.getCart()
    if (cartList[index]) {
      cartList[index].quantity++
      this.saveCart(cartList)
    }
    return cartList
  },

  // 删除商品
  removeItem(index) {
    const cartList = this.getCart()
    cartList.splice(index, 1)
    this.saveCart(cartList)
    return cartList
  },

  // 清空购物车
  clearCart() {
    this.saveCart([])
    return []
  },

  // 计算购物车商品总数
  getTotalCount(cartList) {
    return cartList.reduce((sum, item) => sum + item.quantity, 0)
  },

  // 计算购物车总价格
  getTotalPrice(cartList) {
    return cartList.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }
}
