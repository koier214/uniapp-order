<template>
  <view class="food-detail-container">
    <!-- 顶部返回栏 -->
    <view class="top-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">菜品详情</text>
      <view class="placeholder"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!hasData" class="empty-state">
      <text class="empty-icon">🏪</text>
      <text class="empty-text">当前还在建设中哦~</text>
    </view>

    <!-- 有数据时显示 -->
    <template v-else>
      <!-- 菜品图片 -->
      <view class="food-img-section">
        <view class="food-emoji">{{ foodDetail.emoji }}</view>
      </view>

      <!-- 菜品信息 -->
      <view class="food-info-section">
        <view class="food-name">{{ foodDetail.name }}</view>
        <view class="food-desc">{{ foodDetail.desc }}</view>
        <view class="food-price-row">
          <text class="price-text">¥{{ foodDetail.price }}</text>
          <text v-if="foodDetail.oldPrice" class="old-price">¥{{ foodDetail.oldPrice }}</text>
        </view>
      </view>

      <!-- 菜品详情 -->
      <view v-if="foodDetail.detail" class="detail-section">
        <view class="section-title">菜品详情</view>
        <view class="detail-content">
          <text>{{ foodDetail.detail }}</text>
        </view>
      </view>

      <!-- 规格选择 -->
      <view v-if="specList.length > 0" class="spec-section">
        <view class="section-title">规格</view>
        <view class="spec-list">
          <view 
            v-for="(spec, index) in specList" 
            :key="index"
            :class="['spec-item', { active: currentSpec === index }]"
            @click="selectSpec(index)"
          >
            <text class="spec-name">{{ spec.name }}</text>
            <text class="spec-price">+¥{{ spec.price }}</text>
          </view>
        </view>
      </view>
    </template>

    <!-- 数量选择 -->
    <view class="quantity-section">
      <view class="section-title">数量</view>
      <view class="quantity-control">
        <view class="quantity-btn" @click="decreaseQuantity">-</view>
        <text class="quantity-text">{{ quantity }}</text>
        <view class="quantity-btn" @click="increaseQuantity">+</view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view v-if="hasData && !isLoading" class="bottom-bar">
      <view class="total-price">
        <text class="total-label">合计：</text>
        <text class="total-text">¥{{ totalPrice }}</text>
      </view>
      <view class="action-btn" @click="addToCart">
        <text class="btn-text">加入购物车</text>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getFoodDetail } from '../../api/food.js'

export default {
  data() {
    return {
      quantity: 1,
      currentSpec: 0,
      specList: [],
      foodDetail: {
        name: '',
        desc: '',
        price: 0,
        oldPrice: 0,
        emoji: '',
        detail: ''
      },
      isLoading: true,
      hasData: true
    }
  },
  computed: {
    totalPrice() {
      const basePrice = this.foodDetail.price
      const specPrice = this.specList[this.currentSpec].price
      return (basePrice + specPrice) * this.quantity
    }
  },
  async onLoad(options) {
    if (options.foodId !== undefined) {
      const foodId = parseInt(options.foodId)
      this.foodId = foodId // 保存 foodId 供其他方法使用
      try {
        const result = await getFoodDetail(foodId)
        this.foodDetail = {
          foodId: result.foodId,
          name: result.name,
          desc: result.desc || result.description || '',
          price: result.price,
          oldPrice: result.oldPrice || 0,
          emoji: result.emoji || '🍽️',
          detail: result.detail || '',
          specs: result.specs || []
        }
        // 更新规格列表
        if (result.specs) {
          this.specList = result.specs
        }
        this.isLoading = false
      } catch (error) {
        console.error('获取菜品详情失败', error)
        this.isLoading = false
        this.hasData = false
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    selectSpec(index) {
      this.currentSpec = index
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    increaseQuantity() {
      if (this.quantity < 99) {
        this.quantity++
      }
    },
    addToCart() {
      const basePrice = this.foodDetail.price
      const specPrice = this.specList[this.currentSpec].price
      const finalPrice = basePrice + specPrice
      const specName = this.specList[this.currentSpec].name
      
      // 创建菜品对象，包含规格信息
      const item = {
        foodId: this.foodDetail.foodId,
        id: this.foodDetail.foodId,
        name: this.foodDetail.name + (specName !== '小份' ? `(${specName})` : ''),
        price: finalPrice,
        emoji: this.foodDetail.emoji
      }
      
      // 使用购物车 store 添加商品
      cartStore.addItemWithQuantity(item, this.quantity)
      
      uni.showToast({
        title: '已加入购物车',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style>
page {
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<style scoped>
.food-detail-container {
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* 顶部返回栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 20rpx;
  padding-top: calc(30rpx + env(safe-area-inset-top));
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.25);
  border: 3rpx solid #ffd6e0;
}

.back-icon {
  font-size: 36rpx;
  color: #ff6b9d;
  font-weight: 700;
  line-height: 1;
}

.page-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.placeholder {
  width: 80rpx;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #ff80aa;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #ff80aa;
}

/* 菜品图片 */
.food-img-section {
  margin: 20rpx;
  background: #ffffff;
  border-radius: 32rpx;
  padding: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx rgba(255, 107, 157, 0.35);
  border: 4rpx solid #ffd6e0;
}

.food-emoji {
  font-size: 160rpx;
}

/* 菜品信息 */
.food-info-section {
  margin: 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.3);
  border: 3rpx solid #ffd6e0;
}

.food-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 12rpx;
}

.food-desc {
  font-size: 24rpx;
  color: #ff80aa;
  margin-bottom: 20rpx;
}

.food-price-row {
  display: flex;
  align-items: baseline;
}

.price-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #ff6b9d;
  margin-right: 12rpx;
}

.old-price {
  font-size: 24rpx;
  color: #ffb3d9;
  text-decoration: line-through;
}

/* 通用区块 */
.detail-section,
.spec-section,
.quantity-section {
  margin: 20rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.3);
  border: 3rpx solid #ffd6e0;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 20rpx;
}

/* 详情内容 */
.detail-content {
  font-size: 24rpx;
  color: #ff80aa;
  line-height: 1.8;
}

/* 规格选择 */
.spec-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.spec-item {
  flex: 1;
  min-width: 180rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 3rpx solid #ffd6e0;
  transition: all 0.3s;
}

.spec-item.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-color: #ff6b9d;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}

.spec-name {
  font-size: 24rpx;
  color: #ff4d88;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.spec-item.active .spec-name {
  color: #ffffff;
}

.spec-price {
  font-size: 22rpx;
  color: #ff80aa;
}

.spec-item.active .spec-price {
  color: #fff0f5;
}

/* 数量控制 */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.quantity-btn {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ff6b9d;
  font-weight: 700;
  border: 3rpx solid #ffd6e0;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.2);
}

.quantity-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
  min-width: 60rpx;
  text-align: center;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -8rpx 24rpx rgba(255, 107, 157, 0.15);
  border-top: 4rpx solid #ffd6e0;
}

.total-price {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 24rpx;
  color: #ff80aa;
}

.total-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff6b9d;
}

.action-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  padding: 24rpx 60rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}

.btn-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
