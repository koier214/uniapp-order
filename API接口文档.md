# 后端接口文档

## 基础信息

<!-- **API 根地址**: `https://oopnpjictkfv.sealoshzh.site/api/v1` -->
// 公网调试地址
const BASE_URL = 'https://qhhxncfdtcyd.sealoshzh.site/api/v1'
**统一响应格式**:
```json
// 成功响应
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}

// 失败响应
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

**认证方式**: JWT Token，在请求头中携带：
```
Authorization: Bearer <token>
```

---

## 一、用户模块

### 1. 登录

**路径**: `/user/login`

**方法**: `POST`

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码 |

**成功返回**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "userId": 1,
      "nickname": "美食达人",
      "phone": "13800138000",
      "email": "test@example.com",
      "avatar": "/uploads/xxx.png",
      "signature": "今天也要好好吃饭~",
      "points": 88
    }
  }
}
```

**失败返回**:
```json
{
  "code": 400,
  "message": "用户不存在",
  "data": null
}
```

### 2. 注册

**路径**: `/user/register`

**方法**: `POST`

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| password | string | 是 | 密码（6-72字符） |
| nickname | string | 是 | 昵称 |

**成功返回**:
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 2,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. 获取用户信息

**路径**: `/user/info`

**方法**: `GET`

**认证**: 需要

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "userId": 1,
    "nickname": "美食达人",
    "phone": "13800138000",
    "email": "test@example.com",
    "avatar": "/uploads/xxx.png",
    "signature": "今天也要好好吃饭~",
    "points": 88,
    "level": 2,
    "days": 30
  }
}
```

### 4. 更新用户信息

**路径**: `/user`

**方法**: `PUT`

**认证**: 需要

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称 |
| phone | string | 否 | 手机号（11位） |
| email | string | 否 | 邮箱 |
| signature | string | 否 | 个性签名 |

**成功返回**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "userId": 1,
    "nickname": "新昵称",
    "phone": "13800138000",
    "email": "new@example.com",
    "signature": "新签名"
  }
}
```

### 5. 上传头像

**路径**: `/user/avatar`

**方法**: `POST`

**认证**: 需要

**请求体**: `multipart/form-data`
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件（png/jpg/jpeg/gif） |

**成功返回**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatarUrl": "/uploads/xxx.png"
  }
}
```

---

## 二、菜品模块

### 1. 获取分类列表

**路径**: `/food/categories`

**方法**: `GET`

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    { "categoryId": 1, "name": "热菜", "icon": "🥘", "sort": 1 },
    { "categoryId": 2, "name": "凉菜", "icon": "🥗", "sort": 2 }
  ]
}
```

### 2. 获取菜品列表

**路径**: `/food/list`

**方法**: `GET`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | int | 否 | 分类ID，不传/0/all 返回全部 |

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "foodId": 1,
      "name": "招牌牛肉锅",
      "desc": "人气爆款 · 超实惠",
      "price": 68,
      "oldPrice": 88,
      "emoji": "🍲",
      "image": "",
      "categoryId": 1,
      "detail": "精选上等牛肉...",
      "isHot": true,
      "sort": 1
    }
  ]
}
```

### 3. 获取热门菜品

**路径**: `/food/hot`

**方法**: `GET`

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "foodId": 1,
      "name": "招牌牛肉锅",
      "desc": "人气爆款 · 超实惠",
      "price": 68,
      "oldPrice": 88,
      "emoji": "🍲",
      "image": ""
    }
  ]
}
```

### 4. 获取菜品详情

**路径**: `/food/detail/{food_id}`

**方法**: `GET`

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| food_id | int | 菜品ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "foodId": 1,
    "name": "招牌牛肉锅",
    "desc": "人气爆款 · 超实惠",
    "price": 68,
    "oldPrice": 88,
    "emoji": "🍲",
    "image": "",
    "categoryId": 1,
    "detail": "精选上等牛肉...",
    "isHot": true,
    "sort": 1,
    "specs": [
      { "name": "小份", "price": 0 },
      { "name": "中份", "price": 8 },
      { "name": "大份", "price": 15 }
    ]
  }
}
```

### 5. 初始化菜品数据

**路径**: `/food/init`

**方法**: `POST`

**说明**: 批量添加示例菜品数据（幂等操作，不会重复添加）

**成功返回**:
```json
{
  "code": 200,
  "message": "成功添加 15 个菜品",
  "data": { "added": 15 }
}
```

---

## 三、厨师模块

### 1. 获取厨师信息

**路径**: `/chef/info`

**方法**: `GET`

**说明**: 获取当前厨师的信息，用于结算页面展示

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "chefId": 1,
    "name": "王师傅",
    "title": "金牌厨师",
    "experience": 15,
    "specialty": "川湘菜",
    "rating": 4.9,
    "avatar": "",
    "introduction": "从业15年，擅长川湘菜，曾在多家知名餐厅任职"
  }
}
```

---

## 四、购物车模块

### 1. 获取购物车列表

**路径**: `/cart/list`

**方法**: `GET`

**认证**: 需要

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "cartId": 1,
        "foodId": 1,
        "name": "招牌牛肉锅",
        "price": 68,
        "emoji": "🍲",
        "spec": "中份",
        "quantity": 2
      }
    ],
    "totalCount": 2,
    "totalPrice": 136
  }
}
```

### 2. 添加购物车

**路径**: `/cart/add`

**方法**: `POST`

**认证**: 需要

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| foodId | int | 是 | 菜品ID |
| quantity | int | 是 | 数量 |
| spec | string | 否 | 规格名称 |

**成功返回**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartId": 1,
    "totalCount": 3,
    "totalPrice": 204
  }
}
```

### 3. 更新购物车

**路径**: `/cart/update/{cart_id}`

**方法**: `PUT`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| cart_id | int | 购物车项ID |

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| quantity | int | 是 | 数量（0或负数删除该商品） |

**成功返回**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "totalCount": 2,
    "totalPrice": 136
  }
}
```

### 4. 删除购物车项

**路径**: `/cart/remove/{cart_id}`

**方法**: `DELETE`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| cart_id | int | 购物车项ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "totalCount": 1,
    "totalPrice": 68
  }
}
```

### 5. 清空购物车

**路径**: `/cart/clear`

**方法**: `DELETE`

**认证**: 需要

**成功返回**:
```json
{
  "code": 200,
  "message": "清空成功",
  "data": null
}
```

---

## 五、订单模块

### 1. 创建订单（含优惠计算）

**路径**: `/order/create`

**方法**: `POST`

**认证**: 需要

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | array | 是 | 订单项列表 |
| remark | string | 否 | 备注（少辣、不要香菜等） |
| tableNumber | string | 否 | 桌号 |

**items 数组结构**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| foodId | int | 是 | 菜品ID |
| name | string | 是 | 菜品名称 |
| price | float | 是 | 单价 |
| emoji | string | 否 | 表情符号 |
| quantity | int | 否 | 数量（默认1） |
| spec | string | 否 | 规格 |

**请求示例**:
```json
{
  "items": [
    {
      "foodId": 1,
      "name": "招牌牛肉锅",
      "price": 68,
      "emoji": "🍲",
      "quantity": 2
    },
    {
      "foodId": 3,
      "name": "宫保鸡丁",
      "price": 32,
      "emoji": "🍛",
      "quantity": 1
    }
  ],
  "remark": "少辣，不要香菜"
}
```

**优惠规则**:
| 订单金额 | 优惠 | 实付金额 |
|----------|------|----------|
| < 100元 | 0元 | 原价 |
| 100-199元 | 20元 | 原价 - 20 |
| >= 200元 | 50元 | 原价 - 50 |

**成功返回**:
```json
{
  "code": 200,
  "message": "下单成功",
  "data": {
    "orderId": "ORD20240605120000",
    "orderNo": "ORD20240605120000",
    "items": [
      {
        "foodId": 1,
        "name": "招牌牛肉锅",
        "price": 68,
        "emoji": "🍲",
        "quantity": 2,
        "subtotal": 136
      },
      {
        "foodId": 3,
        "name": "宫保鸡丁",
        "price": 32,
        "emoji": "🍛",
        "quantity": 1,
        "subtotal": 32
      }
    ],
    "totalPrice": 148,
    "originalPrice": 168,
    "discount": 20,
    "actualPrice": 148,
    "remark": "少辣，不要香菜",
    "status": "pending",
    "statusText": "待确认",
    "createTime": "2024-06-05 12:00:00"
  }
}
```

**说明**: 创建订单成功后会自动清空购物车

### 2. 获取订单列表

**路径**: `/order/list`

**方法**: `GET`

**认证**: 需要

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | `all`全部 / `today`今日 |

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "orderId": "ORD20240605120000",
      "orderNo": "ORD20240605120000",
      "location": "万达广场店",
      "status": "completed",
      "statusText": "已完成",
      "items": [
        { "name": "招牌牛肉锅", "count": 2 }
      ],
      "totalPrice": 148,
      "time": "12:00",
      "date": "今天",
      "createTime": "2024-06-05 12:00:00"
    }
  ]
}
```

### 3. 获取订单详情

**路径**: `/order/detail/{order_id}`

**方法**: `GET`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| order_id | string | 订单ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "orderId": "ORD20240605120000",
    "orderNo": "ORD20240605120000",
    "location": "万达广场店",
    "status": "completed",
    "statusText": "已完成",
    "items": [
      {
        "foodId": 1,
        "name": "招牌牛肉锅",
        "price": 68,
        "emoji": "🍲",
        "quantity": 2,
        "subtotal": 136
      }
    ],
    "totalPrice": 148,
    "originalPrice": 168,
    "discount": 20,
    "actualPrice": 148,
    "remark": "少辣，不要香菜",
    "tableNumber": "",
    "createTime": "2024-06-05 12:00:00",
    "updateTime": "2024-06-05 12:30:00"
  }
}
```

### 4. 取消订单

**路径**: `/order/cancel/{order_id}`

**方法**: `PUT`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| order_id | string | 订单ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "取消成功",
  "data": {
    "orderId": "ORD20240605120000",
    "status": "cancelled"
  }
}
```

**错误返回**:
```json
{
  "code": 400,
  "message": "订单状态不允许取消",
  "data": null
}
```

### 5. 催单

**路径**: `/order/remind/{order_id}`

**方法**: `POST`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| order_id | string | 订单ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "催单成功",
  "data": null
}
```

### 6. 再来一单（快速复购）

**路径**: `/order/reorder/{order_id}`

**方法**: `POST`

**认证**: 需要

**说明**: 将历史订单中的菜品快速添加到当前购物车

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| order_id | string | 历史订单ID |

**成功返回**:
```json
{
  "code": 200,
  "message": "已添加到购物车",
  "data": {
    "items": [
      {
        "foodId": 1,
        "name": "招牌牛肉锅",
        "price": 68,
        "emoji": "🍲",
        "quantity": 2
      }
    ],
    "totalCount": 2,
    "totalPrice": 136
  }
}
```

**错误返回**:
```json
{
  "code": 404,
  "message": "订单不存在或该订单无可复购商品",
  "data": null
}
```

---

## 六、评价模块

### 1. 提交评价

**路径**: `/review/submit`

**方法**: `POST`

**认证**: 需要

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rating | int | 是 | 评分（1-5） |
| suggestion | string | 否 | 建议/评语 |

**成功返回**:
```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "reviewId": 1,
    "points": 10
  }
}
```

---

## 七、统计模块

### 1. 获取消费分析

**路径**: `/stats/analysis`

**方法**: `GET`

**认证**: 需要

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "totalOrders": 15,
    "totalAmount": 888,
    "favoriteFoods": [
      { "name": "招牌牛肉锅", "count": 5 },
      { "name": "咖喱鸡肉饭", "count": 3 }
    ],
    "monthlyStats": [
      { "month": "1月", "amount": 300 },
      { "month": "2月", "amount": 288 },
      { "month": "3月", "amount": 300 }
    ]
  }
}
```

### 2. 获取消费历史

**路径**: `/stats/history`

**方法**: `GET`

**认证**: 需要

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码（默认1） |
| pageSize | int | 否 | 每页数量（默认20） |

**成功返回**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "date": "2024-01-01",
        "orders": [
          {
            "orderId": "ORD20240101120000",
            "time": "12:00",
            "items": [{ "name": "招牌牛肉锅", "count": 2 }],
            "totalPrice": 148
          }
        ]
      }
    ],
    "total": 15,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误（如缺少必填字段、订单状态不允许取消） |
| 401 | 未登录或Token失效 |
| 404 | 资源不存在（如订单不存在） |
| 422 | 验证失败（JWT相关） |
| 500 | 服务器内部错误 |

---

## 测试用户

| 字段 | 值 |
|------|------|
| 手机号 | `13800138000` |
| 密码 | `123456` |

---

## 订单状态说明

| 状态值 | 显示文本 | 说明 |
|--------|----------|------|
| pending | 待确认 | 订单已创建，等待商家确认 |
| confirmed | 已确认 | 商家已确认订单 |
| cooking | 制作中 | 菜品正在制作 |
| ready | 已就绪 | 菜品已制作完成 |
| delivering | 配送中 | 正在配送 |
| completed | 已完成 | 订单已完成 |
| cancelled | 已取消 | 订单已取消 |
