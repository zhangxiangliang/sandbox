'use strict'

const Config = use('Config')
const moment = use('moment')
const randomString = use('randomstring')
const logger = use('App/Services/Logger')
const queryString = use('querystring')
const crypto = use('crypto')

class CheckoutController {
  /**
   * @param appid 公众号 ID
   * @param mch_id 商户 ID
   * @param key 密钥
   * @param notity_url 通知地址
   *
   * @param out_trade_no 商户订单号
   * @param body 商品描述
   * @param total_fee 商品价格（单位：分）
   * @param trade_type 支付类型
   * @param product_id 商品 ID
   *
   */
  render ({ view }) {
    const appid = Config.get('wxpay.appid')
    const mch_id = Config.get('wxpay.mch_id')
    const key = Config.get('wxpay.key')
    const notify_url = Config.get('wxpay.notify_url')

    const out_trade_no = moment().local().format('YYYYMMDDHHmmss')
    const body = 'adonis'
    const total_fee = 3
    const trade_type = "NATIVE"
    const product_id = 1
    const nonce_str = randomString.generate(32)

    let sign = this._signGenerate({
      appid, mch_id, notify_url,
      out_trade_no, nonce_str, total_fee,
      trade_type, product_id, key, body,
    })

    logger.debug(sign)

    return view.render('commerce.checkout')
  }

  wxPayNotify () {

  }

  /**
   * @description
   * 1. sort 对数据安装字段名进行排序
   * 2. querystring 对数据进行格式转换 key=value&
   * 3. key 在 querystring 最后加上微信后台设置的 key
   * 4. md5 加密
   * 5. toUpperCase 把数据格式化为大写
   */
  _signGenerate(order) {
    const key = order.key

    const sortedOrder = Object.keys(order).sort()
      .filter(item => item != 'key')
      .reduce((accumulator, key) => {
        accumulator[key] = order[key]
        return accumulator
      }, {})

    const stringOrder = queryString.stringify(sortedOrder, null, null, { encodeURIComponent: queryString.unescape })

    const stringOrderWithKey = `${ stringOrder }&key=${ key }`

    const sign = crypto.createHash('md5')
      .update(stringOrderWithKey)
      .digest('hex')
      .toUpperCase()

    return sign
  }
}

module.exports = CheckoutController
