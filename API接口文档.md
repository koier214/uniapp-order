# 后端接口文档

## 基础信息

**API 根地址**: `https://qhhxncfdtcyd.sealoshzh.site/api/v1`

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
| categoryId | int | 否 | 分类ID，不传返回全部 |

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

**说明**: 批量添加示例菜品数据（仅用于初始化）

**成功返回**:
```json
{
  "code": 200,
  "message": "成功添加 15 个菜品",
  "data": { "added": 15 }
}
```

---

## 三、购物车模块

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

## 四、订单模块

### 1. 创建订单

**路径**: `/order/create`

**方法**: `POST`

**认证**: 需要

**请求体**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| items | array | 是 | 订单项列表 |
| remark | string | 否 | 备注 |
| tableNumber | string | 否 | 桌号 |

**items 数组结构**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| foodId | int | 是 | 菜品ID |
| name | string | 是 | 菜品名称 |
| price | float | 是 | 单价 |
| emoji | string | 否 | 表情符号 |
| quantity | int | 否 | 数量（默认1） |

**成功返回**:
```json
{
  "code": 200,
  "message": "下单成功",
  "data": {
    "orderId": "ORD20240101120000",
    "orderNo": "ORD20240101120000",
    "items": [...],
    "totalPrice": 136,
    "status": "pending",
    "createTime": "2024-01-01 12:00:00"
  }
}
```

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
      "orderId": "ORD20240101120000",
      "orderNo": "ORD20240101120000",
      "location": "万达广场店",
      "status": "completed",
      "statusText": "已完成",
      "items": [
        { "name": "招牌牛肉锅", "count": 2 }
      ],
      "totalPrice": 136,
      "time": "12:00",
      "date": "今天",
      "createTime": "2024-01-01 12:00:00"
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
    "orderId": "ORD20240101120000",
    "orderNo": "ORD20240101120000",
    "location": "万达广场店",
    "status": "completed",
    "statusText": "已完成",
    "items": [
      { "foodId": 1, "name": "招牌牛肉锅", "price": 68, "emoji": "🍲", "quantity": 2 }
    ],
    "totalPrice": 136,
    "remark": "",
    "tableNumber": "",
    "createTime": "2024-01-01 12:00:00",
    "updateTime": "2024-01-01 12:30:00"
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
    "orderId": "ORD20240101120000",
    "status": "cancelled"
  }
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

---

## 五、评价模块

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

## 六、统计模块

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
            "totalPrice": 136
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
| 400 | 请求参数错误 |
| 401 | 未登录或Token失效 |
| 404 | 资源不存在 |
| 422 | 验证失败（JWT相关） |
| 500 | 服务器内部错误 |

---

## 测试用户

| 字段 | 值 |
|------|------|
| 手机号 | `13800138000` |
| 密码 | `123456` |
