<template>
  <view class="menu-list-container">
    <!-- 顶部公告 -->
    <view class="notice-bar">
      <view class="notice-icon">📢</view>
      <text class="notice-text">今日公告：全场满100减20，满200减50，限时优惠！</text>
    </view>

    <!-- 主体区域（左右分栏） -->
    <view class="main-section">
      <!-- 左侧菜品分类 -->
      <scroll-view class="category-side" scroll-y="true">
        <view 
          v-for="(item, index) in categoryList" 
          :key="index"
          :class="['category-item', { active: currentCategory === index }]"
          @click="selectCategory(index)"
        >
          <text class="category-name">{{ item.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧菜品列表 -->
      <scroll-view class="food-side" scroll-y="true">
        <!-- 空状态 -->
        <view v-if="isEmpty" class="empty-state">
          <text class="empty-icon">🏪</text>
          <text class="empty-text">{{ emptyText }}</text>
        </view>
        <view v-else v-for="(food, index) in currentFoodList" :key="index" class="food-item">
          <view class="food-avatar" @click="goToFoodDetail(currentCategory, index)">
            <image class="food-img" src="" mode="aspectFill" />
            <text class="food-emoji">{{ food.emoji }}</text>
          </view>
          <view class="food-info" @click="goToFoodDetail(currentCategory, index)">
            <view class="food-name">{{ food.name }}</view>
            <view class="food-desc">{{ food.desc }}</view>
            <view class="food-bottom">
              <view class="food-price">
                <text class="price-text">¥{{ food.price }}</text>
                <text v-if="food.oldPrice" class="old-price">¥{{ food.oldPrice }}</text>
              </view>
              <view class="add-cart" @click.stop="addToCart(food)">
                <text class="add-icon">+</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航 -->
    <view class="tab-bar">
      <view class="tab-item" @click="goToPage('/pages/menu/menu')">
        <text class="tab-icon">🏠</text>
        <text class="tab-name">首页</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">📋</text>
        <text class="tab-name">菜单</text>
      </view>
      <view class="tab-item" @click="goToPage('/pages/order/order')">
        <text class="tab-icon">📦</text>
        <text class="tab-name">订单</text>
      </view>
      <view class="tab-item" @click="goToPage('/pages/user/user')">
        <text class="tab-icon">👤</text>
        <text class="tab-name">我的</text>
      </view>
    </view>

    <!-- 购物车按钮 -->
    <view 
      class="cart-btn" 
      v-if="cartList.length > 0" 
      :style="{ right: cartPosition.right, left: cartPosition.left }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="toggleCart"
    >
      <text class="cart-icon">🛒</text>
      <view class="cart-badge">{{ cartTotalCount }}</view>
    </view>

    <!-- 购物车列表弹窗 -->
    <view class="cart-overlay" v-if="showCart" @click="toggleCart">
      <view class="cart-popup" @click.stop>
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <view class="cart-clear" @click="clearCart">清空</view>
        </view>
        <scroll-view class="cart-list" scroll-y>
          <view class="cart-item" v-for="(item, index) in cartList" :key="index">
            <view class="cart-item-left">
              <text class="cart-item-emoji">{{ item.emoji }}</text>
              <view class="cart-item-info">
                <text class="cart-item-name">{{ item.name }}</text>
                <text class="cart-item-price">¥{{ item.price }}</text>
              </view>
            </view>
            <view class="cart-item-right">
              <view class="quantity-minus" @click="decreaseCartItem(index)">-</view>
              <text class="quantity-num">{{ item.quantity }}</text>
              <view class="quantity-plus" @click="increaseCartItem(index)">+</view>
            </view>
          </view>
        </scroll-view>
        <view class="cart-footer">
          <text class="cart-total">合计：¥{{ cartTotalPrice }}</text>
          <view class="cart-checkout">去结算</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getCategories, getFoodList } from '../../api/food.js'

export default {
  data() {
    return {
      currentCategory: 0,
      categoryList: [],
      foodList: [],
      cartList: [],
      showCart: false,
      cartPosition: { right: '30rpx', left: 'auto' },
      startX: 0,
      startY: 0,
      isDragging: false,
      isEmpty: false,
      emptyText: '当前还在建设中哦~'
    }
  },
  onLoad(options) {
    if (options.category) {
      this.currentCategory = parseInt(options.category)
    }
    this.loadCategories()
  },
  onShow() {
    // 页面显示时从 store 获取最新购物车数据
    this.cartList = cartStore.getCart()
    // 如果购物车为空，关闭弹窗
    if (this.cartList.length === 0) {
      this.showCart = false
    }
  },
  computed: {
    currentFoodList() {
      return this.foodList[this.currentCategory] || []
    },
    cartTotalCount() {
      return cartStore.getTotalCount(this.cartList)
    },
    cartTotalPrice() {
      return cartStore.getTotalPrice(this.cartList)
    }
  },
  methods: {
    async loadCategories() {
      try {
        const categories = await getCategories()
        // 转换 categoryId 为 id 以兼容前端逻辑
        this.categoryList = [
          { name: '全部', id: 0, categoryId: 0 },
          ...categories.map(cat => ({ ...cat, id: cat.categoryId }))
        ]
        // 初始化菜品列表
        this.foodList = Array(this.categoryList.length).fill(null).map(() => [])
        // 加载当前分类的菜品
        await this.loadFoodList(this.currentCategory)
      } catch (error) {
        console.error('获取分类失败', error)
        this.isEmpty = true
        this.emptyText = '当前还在建设中哦~'
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      }
    },
    async loadFoodList(categoryId) {
      try {
        const foods = await getFoodList(categoryId)
        this.foodList[categoryId] = foods.map(item => ({
          foodId: item.foodId,
          id: item.foodId,
          name: item.name,
          desc: item.desc || item.description || '',
          price: item.price,
          oldPrice: item.oldPrice,
          emoji: item.emoji || '🍽️',
          image: item.image,
          categoryId: item.categoryId
        }))
        // 检查是否有数据
        if (!foods || foods.length === 0) {
          this.isEmpty = true
          this.emptyText = '当前还在建设中哦~'
        } else {
          this.isEmpty = false
        }
      } catch (error) {
        console.error('获取菜品失败', error)
        this.isEmpty = true
        this.emptyText = '当前还在建设中哦~'
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      }
    },
    selectCategory(index) {
      this.currentCategory = index
      const categoryId = this.categoryList[index]?.id || 0
      if (!this.foodList[index] || this.foodList[index].length === 0) {
        this.loadFoodList(categoryId)
      }
    },
    addToCart(food) {
      this.cartList = cartStore.addItem(food)
      
      uni.showToast({
        title: `已加入购物车`,
        icon: 'success',
        duration: 1000
      })
    },
    goToPage(path) {
      uni.reLaunch({
        url: path
      })
    },
    goToFoodDetail(category, index) {
      const food = this.foodList[category][index]
      uni.navigateTo({
        url: `/pages/foodDetail/foodDetail?foodId=${food.id}`
      })
    },
    toggleCart() {
      this.showCart = !this.showCart
    },
    clearCart() {
      this.cartList = cartStore.clearCart()
      this.showCart = false
    },
    decreaseCartItem(index) {
      this.cartList = cartStore.decreaseItem(index)
      // 如果购物车为空，关闭弹窗
      if (this.cartList.length === 0) {
        this.showCart = false
      }
    },
    increaseCartItem(index) {
      this.cartList = cartStore.increaseItem(index)
    },
    onTouchStart(e) {
      this.isDragging = true
      const touch = e.touches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY
    },
    onTouchMove(e) {
      if (!this.isDragging) return
    },
    onTouchEnd(e) {
      if (!this.isDragging) return
      this.isDragging = false
      
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const screenWidth = uni.getSystemInfoSync().screenWidth
      
      if (endX < screenWidth / 2) {
        this.cartPosition = { left: '30rpx', right: 'auto' }
      } else {
        this.cartPosition = { right: '30rpx', left: 'auto' }
      }
    }
  }
}
</script>

<style scoped>
/* 注意：page 样式不能 scoped，需要单独处理 */
</style>
<style>
page {
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 50%, #ffd6e0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}
</style>
<style scoped>
.menu-list-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20rpx 0;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 顶部公告 */
.notice-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  margin: 0 20rpx 16rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.35), 0 8rpx 22rpx rgba(255, 107, 157, 0.18);
  border: 3rpx solid #ffd6e0;
  flex-shrink: 0;
}

.notice-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.notice-text {
  flex: 1;
  font-size: 24rpx;
  color: #ff4d88;
  line-height: 1.4;
}

/* 主体区域 */
.main-section {
  display: flex;
  flex: 1;
  margin: 0 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 22rpx 60rpx rgba(255, 107, 157, 0.45), 0 11rpx 30rpx rgba(255, 107, 157, 0.22);
  border: 4rpx solid #ffd6e0;
  min-height: 0;
}

/* 左侧分类 */
.category-side {
  width: 180rpx;
  height: 100%;
  background: linear-gradient(180deg, #fff5f8 0%, #ffe4ed 100%);
}

.category-item {
  padding: 36rpx 24rpx;
  text-align: center;
  position: relative;
}

.category-item.active {
  background: #ffffff;
  border-left: 6rpx solid #ff6b9d;
}

.category-item.active .category-name {
  color: #ff4d88;
  font-weight: 700;
}

.category-name {
  font-size: 26rpx;
  color: #ff80aa;
  font-weight: 500;
}

/* 右侧菜品 */
.food-side {
  flex: 1;
  height: 100%;
  padding: 20rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #ff80aa;
  text-align: center;
}

.food-item {
  display: flex;
  background: #fff9fb;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 3rpx solid #ffd6e0;
  box-shadow: 0 14rpx 40rpx rgba(255, 107, 157, 0.3), 0 7rpx 20rpx rgba(255, 107, 157, 0.15);
}

.food-avatar {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  position: relative;
  overflow: hidden;
  border: 3rpx solid #ffd6e0;
  box-shadow: 0 6rpx 18rpx rgba(255, 107, 157, 0.2);
}

.food-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.food-emoji {
  position: relative;
  z-index: 1;
  font-size: 60rpx;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.food-desc {
  font-size: 22rpx;
  color: #ff80aa;
  margin-bottom: 16rpx;
}

.food-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.food-price {
  display: flex;
  align-items: center;
}

.price-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff6b9d;
  margin-right: 12rpx;
}

.old-price {
  font-size: 22rpx;
  color: #ffb3d9;
  text-decoration: line-through;
}

.add-cart {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.3);
}

.add-icon {
  font-size: 40rpx;
  color: #ffffff;
  font-weight: 700;
  line-height: 1;
}

/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  background: #ffffff;
  padding: 16rpx 0;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 24rpx rgba(255, 107, 157, 0.15);
  border-top: 4rpx solid #ffd6e0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
  border-radius: 16rpx;
  margin: 0 8rpx;
  transition: none;
  box-sizing: border-box;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
}

.tab-item.active .tab-icon,
.tab-item.active .tab-name {
  color: #ffffff;
  font-weight: 700;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
  color: #ffb3d9;
}

.tab-name {
  font-size: 22rpx;
  color: #ffb3d9;
  font-weight: 400;
}

.tab-item:not(.active) .tab-name {
  color: #ff80aa;
}

.tab-item:not(.active) .tab-name,
.tab-item:not(.active) .tab-icon {
  font-weight: 400 !important;
}

/* 购物车按钮 */
.cart-btn {
  position: fixed;
  bottom: 200rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.4);
  z-index: 9998;
  transition: left 0.3s, right 0.3s;
  border: 4rpx solid #ffd6e0;
}

.cart-icon {
  font-size: 56rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 44rpx;
  height: 44rpx;
  background: #ff4d88;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 700;
  padding: 0 8rpx;
  border: 3rpx solid #ffffff;
}

/* 购物车弹窗 */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.cart-popup {
  width: 100%;
  max-width: 100vw;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20rpx 60rpx rgba(255, 107, 157, 0.3);
  box-sizing: border-box;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-bottom: 3rpx solid #ffd6e0;
}

.cart-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.cart-clear {
  font-size: 26rpx;
  color: #ff80aa;
  font-weight: 500;
}

.cart-list {
  flex: 1;
  max-height: 50vh;
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #ffe4ed;
  width: 100%;
  box-sizing: border-box;
}

.cart-item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cart-item-emoji {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
}

.cart-item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.cart-item-price {
  font-size: 24rpx;
  color: #ff80aa;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.quantity-minus,
.quantity-plus {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #ff6b9d;
  font-weight: 700;
  border: 2rpx solid #ffd6e0;
}

.quantity-num {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  min-width: 40rpx;
  text-align: center;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 3rpx solid #ffd6e0;
}

.cart-total {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
}

.cart-checkout {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  padding: 20rpx 50rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}
</style>
