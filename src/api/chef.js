// 厨师模块API
import { get } from '../utils/request.js'

// 获取厨师信息
export function getChefInfo() {
  return get('/chef/info')
}
