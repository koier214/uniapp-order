<template>
  <view class="time-lottie-avatar">
    <!-- 点击区域 -->
    <view 
      id="lottie-container" 
      class="lottie-box"
      :class="{ 'is-clicked': isClicked }"
      @click="handleClick"
    >
      <!-- #ifdef H5 -->
      <!-- Lottie动画容器（仅H5环境可用） -->
      <view id="panda-lottie" class="panda-lottie"></view>
      <!-- #endif -->
      
      <!-- #ifdef MP-WEIXIN -->
      <!-- 小程序环境：显示静态熊猫emoji（小程序没有DOM，无法使用lottie-web） -->
      <view class="panda-placeholder">
        <text class="panda-emoji">{{ pandaEmoji }}</text>
        <text class="panda-label">{{ pandaLabel }}</text>
      </view>
      <!-- #endif -->
      
      <!-- 喜欢动画遮罩 -->
      <view v-if="isClicked" class="like-overlay">
        <view class="like-heart">❤️</view>
        <view class="like-text">爱你哦~</view>
      </view>
      
      <!-- 点击扩散的心形粒子 -->
      <view v-if="showHearts" class="heart-particles">
        <view 
          v-for="(heart, index) in hearts" 
          :key="index"
          class="heart-particle"
          :style="heart.style"
        >{{ heart.emoji }}</view>
      </view>
    </view>
    
    <!-- 时间段提示 -->
    <view class="time-hint">{{ currentHint }}</view>
  </view>
</template>

<script>
/**
 * TimeLottieAvatar 组件
 * 
 * 功能说明：
 * 1. 根据当前时间自动显示对应动作的卡通熊猫头像
 * 2. 支持四个时间段的不同Lottie动画效果
 * 3. 点击头像时显示"喜欢"的动画效果
 * 4. 使用Lottie动画实现流畅的交互体验
 * 
 * 设计思路：
 * - 通过获取系统当前时间，判断所属时间段
 * - 每个时间段对应不同的Lottie动画JSON文件
 * - 使用lottie-web库加载和播放动画
 * - 点击事件触发喜欢动画（粒子效果）
 * - 组件支持自动监听时间变化，60秒刷新一次
 * 
 * 时间段映射：
 * 00:00-08:00 → 睡觉（sleeping panda）
 * 08:00-12:00 → 睡眼朦胧（waking panda）
 * 12:00-18:00 → 吃饭/工作（eating panda）
 * 18:00-24:00 → 运动（sport panda）
 * 
 * 使用说明：
 * 需要在 static/lottie/ 目录下放置以下JSON文件：
 * - sleeping.json  - 睡觉熊猫
 * - waking.json    - 刚睡醒熊猫
 * - eating.json    - 吃饭熊猫
 * - sport.json     - 运动熊猫
 */
export default {
  name: 'TimeLottieAvatar',
  
  data() {
    return {
      currentTimePeriod: 'waking', // 默认时间段
      timer: null, // 定时器
      currentHint: '', // 当前提示文本
      isClicked: false, // 是否点击中
      showHearts: false, // 是否显示心形粒子
      hearts: [], // 心形粒子数组
      lottieInstance: null // Lottie动画实例
    }
  },
  
  // 时间段与提示文字的映射
  computed: {
    hintMap() {
      return {
        sleeping: '晚安，好梦~',
        waking: '早上好，刚起床呢~',
        eating: '午饭/工作时间到啦！',
        sport: '晚上好，动一动吧~'
      }
    },
    // Lottie动画文件路径映射
    animationMap() {
      return {
        sleeping: '/static/lottie/sleeping.json',
        waking: '/static/lottie/waking.json',
        eating: '/static/lottie/eating.json',
        sport: '/static/lottie/sport.json'
      }
    },
    // 小程序环境：熊猫emoji映射（替代lottie动画）
    pandaEmoji() {
      const emojiMap = {
        sleeping: '🐼💤',
        waking: '🐼😪',
        eating: '🐼🍜',
        sport: '🐼🏃'
      }
      return emojiMap[this.currentTimePeriod] || '🐼'
    },
    // 小程序环境：熊猫状态文字
    pandaLabel() {
      const labelMap = {
        sleeping: '睡觉中...',
        waking: '刚睡醒...',
        eating: '吃饭中...',
        sport: '运动中...'
      }
      return labelMap[this.currentTimePeriod] || ''
    }
  },
  
  mounted() {
    // 组件挂载时初始化
    this.checkTime()
    // 启动定时器，每分钟检查一次时间
    this.startTimer()
    // #ifdef H5
    // H5环境加载lottie动画
    this.$nextTick(() => {
      this.loadLottieAnimation(this.currentTimePeriod)
    })
    // #endif
  },
  
  // 当时间时间段变化时，重新加载动画
  watch: {
    currentTimePeriod(newVal) {
      // #ifdef H5
      this.loadLottieAnimation(newVal)
      // #endif
    }
  },
  
  beforeDestroy() {
    // 组件销毁时清除定时器和动画
    this.stopTimer()
    this.destroyLottie()
  },
  
  methods: {
    /**
     * 检查当前时间并设置对应的时间段
     */
    checkTime() {
      const hour = new Date().getHours()
      
      // 根据小时判断时间段
      if (hour >= 0 && hour < 8) {
        this.currentTimePeriod = 'sleeping'
      } else if (hour >= 8 && hour < 12) {
        this.currentTimePeriod = 'waking'
      } else if (hour >= 12 && hour < 18) {
        this.currentTimePeriod = 'eating'
      } else {
        this.currentTimePeriod = 'sport'
      }
      
      // 更新提示文字
      this.currentHint = this.hintMap[this.currentTimePeriod]
      
      // #ifdef H5
      // 加载对应的Lottie动画（仅H5环境）
      this.$nextTick(() => {
        this.loadLottieAnimation(this.currentTimePeriod)
      })
      // #endif
    },
    
    /**
     * 加载Lottie动画（仅H5环境）
     * @param {string} period - 时间段标识
     */
    // #ifdef H5
    async loadLottieAnimation(period) {
      // 尝试加载Lottie动画，失败则显示占位图
      try {
        await this.loadLottieWithLibrary(period)
      } catch (error) {
        console.warn('Lottie加载失败，显示占位图:', error)
        this.showPlaceholder(period)
      }
    },
    
    /**
     * 使用lottie-web库加载动画
     * 直接使用全局lottie对象（已在index.html中通过CDN引入）
     * 使用fetch加载JSON文件以避免XMLHttpRequest响应类型问题
     */
    loadLottieWithLibrary(period) {
      return new Promise(async (resolve, reject) => {
        const container = document.getElementById('panda-lottie')
        if (!container) {
          reject(new Error('Container not found'))
          return
        }
        
        try {
          // 直接使用全局lottie对象
          const lottie = window.lottie
          if (!lottie) {
            throw new Error('lottie-web not loaded')
          }
          console.log('lottie-web loaded successfully')
          
          // 如果已有动画实例，先销毁
          if (this.lottieInstance) {
            this.lottieInstance.destroy()
            this.lottieInstance = null
          }
          
          // 使用fetch API加载JSON文件，避免XMLHttpRequest响应类型问题
          const animationPath = this.animationMap[period]
          console.log('Loading animation from:', animationPath)
          
          const response = await fetch(animationPath)
          
          // 检查响应状态，如果文件不存在则显示占位图
          if (!response.ok) {
            console.warn(`Animation file not found: ${animationPath}, showing placeholder`)
            this.showPlaceholder(period)
            resolve() // 不拒绝，因为这是预期的缺失文件情况
            return
          }
          
          // 检查内容类型，确保返回的是JSON
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            console.warn(`Animation file is not valid JSON: ${animationPath}, showing placeholder`)
            this.showPlaceholder(period)
            resolve()
            return
          }
          
          const animationData = await response.json()
          console.log('Animation JSON loaded successfully')
          
          this.lottieInstance = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData  // 使用animationData而不是path
          })
          
          console.log(`${period} 熊猫动画加载成功`)
          resolve()
          
        } catch (error) {
          console.error('lottie-web导入失败:', error)
          // 发生错误时显示占位图
          this.showPlaceholder(period)
          resolve() // 不拒绝，避免组件崩溃
        }
      })
    },
    
    /**
     * 显示占位图（当Lottie文件不存在时）
     */
    showPlaceholder(period) {
      const container = document.getElementById('panda-lottie')
      if (!container) return
      
      // 不同时间段的占位熊猫emoji
      const pandaEmojis = {
        sleeping: '🐼💤',
        waking: '🐼😪',
        eating: '🐼🍜',
        sport: '🐼🏃'
      }
      
      const emoji = pandaEmojis[period] || '🐼'
      const timeLabels = {
        sleeping: '睡觉中...',
        waking: '刚睡醒...',
        eating: '吃饭中...',
        sport: '运动中...'
      }
      
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        ">
          <div style="font-size: 80rpx;">${emoji}</div>
          <div style="
            font-size: 18rpx;
            color: #ff80aa;
            margin-top: 10rpx;
          ">${timeLabels[period]}</div>
        </div>
      `
    },
    
    /**
     * 销毁Lottie动画实例
     */
    destroyLottie() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy()
        this.lottieInstance = null
      }
    },
    // #endif
    
    /**
     * 启动定时器，每分钟刷新一次时间
     */
    startTimer() {
      this.timer = setInterval(() => {
        this.checkTime()
      }, 60000) // 60秒 = 1分钟
    },
    
    /**
     * 停止定时器
     */
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    
    /**
     * 处理头像点击事件
     * 触发喜欢动画效果
     */
    handleClick() {
      // 如果已经在动画中，则忽略
      if (this.isClicked) return
      
      // 1. 显示喜欢状态
      this.isClicked = true
      
      // 2. 生成心形粒子
      this.generateHearts()
      
      // 3. 1.5秒后恢复原状态
      setTimeout(() => {
        this.isClicked = false
        this.showHearts = false
        this.hearts = []
      }, 1500)
    },
    
    /**
     * 生成心形粒子动画
     * 随机生成多个心形向上飘动
     */
    generateHearts() {
      const heartEmojis = ['❤️', '💕', '💗', '💖', '💓', '🧡', '💛', '💚']
      const particleCount = 8 // 粒子数量
      
      this.hearts = []
      
      for (let i = 0; i < particleCount; i++) {
        // 随机生成粒子的样式属性
        const randomX = (Math.random() - 0.5) * 200 // 随机X偏移
        const randomRotate = (Math.random() - 0.5) * 60 // 随机旋转角度
        const randomScale = 0.5 + Math.random() * 0.8 // 随机大小
        const randomDelay = Math.random() * 0.3 // 随机延迟
        const randomEmoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
        
        this.hearts.push({
          emoji: randomEmoji,
          style: {
            transform: `translateX(${randomX}rpx) rotate(${randomRotate}deg) scale(${randomScale})`,
            animationDelay: `${randomDelay}s`,
            opacity: 1
          }
        })
      }
      
      this.showHearts = true
    }
  }
}
</script>

<style scoped>
.time-lottie-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.lottie-box {
  width: 200rpx;
  height: 200rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 157, 0.3);
  border: 4rpx solid #ffd6e0;
  overflow: visible; /* 改为visible，让粒子能显示在容器外 */
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* 点击时的放大效果 */
.lottie-box.is-clicked {
  transform: scale(1.15);
  box-shadow: 0 15rpx 40rpx rgba(255, 107, 157, 0.5);
  border-color: #ff4d88;
}

/* Lottie动画容器 */
.panda-lottie {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 喜欢动画遮罩 */
.like-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 240, 245, 0.95);
  border-radius: 50%;
  animation: fadeIn 0.3s ease;
}

.like-heart {
  font-size: 80rpx;
  animation: heartbeat 0.6s ease-in-out infinite;
}

.like-text {
  font-size: 24rpx;
  color: #ff4d88;
  font-weight: 600;
  margin-top: 10rpx;
  animation: fadeInUp 0.5s ease forwards;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 心跳动画 */
@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.2);
  }
}

/* 文字淡入上移动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 心形粒子容器 */
.heart-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
}

/* 单个心形粒子 */
.heart-particle {
  position: absolute;
  font-size: 40rpx;
  animation: floatUp 1.5s ease-out forwards;
  white-space: nowrap;
}

/* 向上飘动并消失的动画 */
@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-150rpx) scale(0.5);
  }
}

.time-hint {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #ff4d88;
  font-weight: 500;
}

/* 小程序环境熊猫占位 */
.panda-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.panda-emoji {
  font-size: 80rpx;
}

.panda-label {
  font-size: 20rpx;
  color: #ff80aa;
  margin-top: 10rpx;
  font-weight: 500;
}
</style>
