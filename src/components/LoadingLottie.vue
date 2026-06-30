<template>
  <view v-if="show" class="loading-lottie-overlay">
    <view class="loading-lottie-container">
      <!-- Lottie动画容器 -->
      <view id="loading-lottie" class="loading-lottie"></view>
      
      <!-- 加载提示文字 -->
      <view class="loading-text">{{ loadingText }}</view>
      
      <!-- 加载时长显示（调试用） -->
      <view v-if="showDuration" class="duration-text">已加载 {{ displayDuration }}ms</view>
    </view>
  </view>
</template>

<script>
/**
 * LoadingLottie 组件
 * 
 * 功能说明：
 * 1. 使用Lottie动画展示加载效果
 * 2. 支持自定义加载提示文字
 * 3. 支持手动控制显示/隐藏
 * 4. 支持设置最小显示时长（避免动画闪一下就消失）
 * 5. 支持自动隐藏（设置最大显示时长）
 * 6. 自动加载 loading.json 动画文件
 * 
 * 设计思路：
 * - 使用lottie-web库加载JSON动画
 * - 通过v-if控制整个遮罩层的显示
 * - 支持props传入加载文字和时长参数
 * - 提供show/hide方法供父组件调用
 * - 使用setTimeout实现最小/最大时长控制
 * - 在showLoading时动态加载动画（因为此时容器才存在）
 * 
 * 使用说明：
 * 需要在 static/lottie/ 目录下放置 loading.json 文件
 * 
 * Props:
 * - loadingText: 加载提示文字（默认："加载中..."）
 * - minDuration: 最小显示时长（毫秒，默认：500ms），确保动画至少显示一段时间
 * - maxDuration: 最大显示时长（毫秒，默认：0表示不自动隐藏），超过此时长自动隐藏
 * - showDuration: 是否显示当前加载时长（调试用，默认：false）
 * 
 * Methods:
 * - showLoading(): 显示加载动画
 * - hideLoading(): 隐藏加载动画
 */
export default {
  name: 'LoadingLottie',
  
  props: {
    // 加载提示文字
    loadingText: {
      type: String,
      default: '加载中...'
    },
    // 最小显示时长（毫秒）- 确保动画至少显示一段时间
    minDuration: {
      type: Number,
      default: 500
    },
    // 最大显示时长（毫秒）- 0表示不自动隐藏
    maxDuration: {
      type: Number,
      default: 0
    },
    // 是否显示当前加载时长（调试用）
    showDuration: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      show: false, // 是否显示加载动画
      lottieInstance: null, // Lottie动画实例
      startTime: 0, // 动画开始时间
      durationInterval: null, // 时长显示定时器
      displayDuration: 0, // 当前显示时长（毫秒）
      minDurationTimer: null, // 最小时长定时器
      maxDurationTimer: null, // 最大时长定时器
      animationLoaded: false // 动画是否已加载
    }
  },
  
  watch: {
    // 当show变为true时，加载动画
    show(newVal) {
      if (newVal && !this.animationLoaded) {
        this.$nextTick(() => {
          this.loadLottieAnimation()
        })
      }
    }
  },
  
  beforeDestroy() {
    // 组件销毁时清除定时器和动画
    this.clearTimers()
    this.destroyLottie()
  },
  
  methods: {
    /**
     * 显示加载动画
     * @param {Object} options - 可选参数
     * @param {Number} options.minDuration - 覆盖props的最小时长
     * @param {Number} options.maxDuration - 覆盖props的最大时长
     */
    showLoading(options = {}) {
      // 清除之前的定时器
      this.clearTimers()
      
      // 记录开始时间
      this.startTime = Date.now()
      this.displayDuration = 0
      
      // 显示遮罩层（触发watch加载动画）
      this.show = true
      
      // 设置最小显示时长
      const minDuration = options.minDuration !== undefined ? options.minDuration : this.minDuration
      this.minDurationTimer = setTimeout(() => {
        this.minDurationTimer = null
      }, minDuration)
      
      // 设置最大显示时长（自动隐藏）
      const maxDuration = options.maxDuration !== undefined ? options.maxDuration : this.maxDuration
      if (maxDuration > 0) {
        this.maxDurationTimer = setTimeout(() => {
          this.hideLoading()
        }, maxDuration)
      }
      
      // 如果需要显示时长，启动定时器
      if (this.showDuration) {
        this.startDurationDisplay()
      }
    },
    
    /**
     * 隐藏加载动画
     * 如果最小时长还没到，则等待最小时长结束后再隐藏
     */
    hideLoading() {
      // 如果最小时长定时器还在运行，等待它结束
      if (this.minDurationTimer) {
        return
      }
      
      // 清除所有定时器
      this.clearTimers()
      
      // 隐藏动画
      this.show = false
    },
    
    /**
     * 启动时长显示定时器
     */
    startDurationDisplay() {
      this.durationInterval = setInterval(() => {
        this.displayDuration = Date.now() - this.startTime
      }, 50)
    },
    
    /**
     * 清除所有定时器
     */
    clearTimers() {
      if (this.minDurationTimer) {
        clearTimeout(this.minDurationTimer)
        this.minDurationTimer = null
      }
      if (this.maxDurationTimer) {
        clearTimeout(this.maxDurationTimer)
        this.maxDurationTimer = null
      }
      if (this.durationInterval) {
        clearInterval(this.durationInterval)
        this.durationInterval = null
      }
    },
    
    /**
     * 加载Lottie动画
     */
    async loadLottieAnimation() {
      try {
        await this.loadLottieWithLibrary()
      } catch (error) {
        console.warn('Lottie加载失败，显示占位图:', error)
        this.showPlaceholder()
      }
    },
    
    /**
     * 使用lottie-web库加载动画
     * 直接使用全局lottie对象（已在index.html中通过CDN引入）
     * 使用fetch加载JSON文件以避免XMLHttpRequest响应类型问题
     */
    loadLottieWithLibrary() {
      return new Promise(async (resolve, reject) => {
        // 等待DOM渲染完成
        setTimeout(async () => {
          const container = document.getElementById('loading-lottie')
          if (!container) {
            console.error('Lottie container not found!')
            reject(new Error('Container not found'))
            return
          }
          
          console.log('Lottie container found:', container)
          
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
            const animationPath = '/static/lottie/loading.json'
            console.log('Loading animation from:', animationPath)
            
            const response = await fetch(animationPath)
            
            // 检查响应状态
            if (!response.ok) {
              console.warn(`Animation file not found: ${animationPath}, showing placeholder`)
              this.showPlaceholder()
              resolve()
              return
            }
            
            // 检查内容类型
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
              console.warn(`Animation file is not valid JSON: ${animationPath}, showing placeholder`)
              this.showPlaceholder()
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
            
            console.log('Lottie animation loaded successfully!')
            this.animationLoaded = true
            resolve()
            
          } catch (error) {
            console.error('Failed to load lottie animation:', error)
            this.showPlaceholder()
            resolve() // 不拒绝，确保组件能正常工作
          }
        }, 50)
      })
    },
    
    /**
     * 显示占位图（当Lottie文件不存在时）
     */
    showPlaceholder() {
      const container = document.getElementById('loading-lottie')
      if (!container) return
      
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        ">
          <div style="font-size: 80rpx;">⏳</div>
          <div style="
            font-size: 18rpx;
            color: #ff80aa;
            margin-top: 10rpx;
          ">加载中...</div>
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
      this.animationLoaded = false
    }
  }
}
</script>

<style scoped>
/* 加载动画遮罩层 */
.loading-lottie-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

/* 加载动画容器 */
.loading-lottie-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Lottie动画容器 */
.loading-lottie {
  width: 300rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff0f5;
  border-radius: 20rpx;
}

/* 加载文字 */
.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #ff4d88;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 时长显示文字 */
.duration-text {
  margin-top: 15rpx;
  font-size: 20rpx;
  color: #ffb3d9;
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

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>