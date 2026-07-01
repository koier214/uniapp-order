// 项目全局配置
// 静态资源服务器地址（用于拼接头像等图片URL）

// 生产环境
const STATIC_BASE_URL = 'https://oopnpjictkfv.sealoshzh.site'
// 测试环境
// const STATIC_BASE_URL = 'https://qhhxncfdtcyd.sealoshzh.site'

/**
 * 拼接静态资源完整URL
 * @param {string} path - 资源相对路径，如 /uploads/avatar.png
 * @returns {string} 完整URL
 */
export function getStaticUrl(path) {
  if (!path) return ''
  // 已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return STATIC_BASE_URL + path
}
