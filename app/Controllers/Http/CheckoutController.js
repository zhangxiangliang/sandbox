'use strict'

const Config = use('Config')
const moment = use('moment')
const randomString = use('randomstring')
const logger = use('App/Services/Logger')
const queryString = use('querystring')
const crypto = use('crypto')
const convert = use('xml-js')
const axios = use('axios')
const qrcode = use('qrcode')

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
  async render ({ view }) {
    const appid = Config.get('wxpay.appid')
    const mch_id = Config.get('wxpay.mch_id')
    const key = Config.get('wxpay.key')
    const notify_url = Config.get('wxpay.notify_url')
    const unifiedOrderApi = Config.get('wxpay.api.unifiedorder')

    const out_trade_no = moment().local().format('YYYYMMDDHHmmss')
    const body = 'adonis'
    const total_fee = 3
    const trade_type = "NATIVE"
    const product_id = 1
    const nonce_str = randomString.generate(32)

    let order = {
      appid, mch_id, notify_url,
      out_trade_no, nonce_str, total_fee,
      trade_type, product_id, body,
    };

    let sign = this.wxPaySign(order, key);

    const xmlOrder = convert.js2xml(
      { xml: { ...order, sign }},
      { compact: true }
    );

    const wxPayResponse = await axios.post(unifiedOrderApi, xmlOrder)
    const _prepay = convert.xml2js(wxPayResponse.data, {
      compact :true,
      cdataKey: 'value',
      textKey: 'value'
    }).xml
    const prepay = Object.keys(_prepay).reduce((accumulator, key) => {
      accumulator[key] = _prepay[key].value
      return accumulator
    }, {})

    const qrcodeUrl = await qrcode.toDataURL(
      prepay.code_url || 'https://wx.qq.com/',
      {width: 300})

    return view.render('commerce.checkout', { qrcodeUrl })
  }

  /**
   * 微信通知回调函数
   * 用于接受支付成功的回调 并 返回接收结果
   */
  wxPayNotify ({ request }) {
    const _payment = convert.xml2js(request._raw, {
      compact: true,
      cdataKey: 'value',
      textKey: 'value'
    }).xml

    const payment = Object.keys(_payment).reduce((accumulator, key) => {
      accumulator[key] = _payment[key].value
      return accumulator
    })

    // 检查签名 || 检查金额
    const paymentSign = payment.sign
    delete payment['sign']

    const key = Config.get('wxpay.key')
    const selfSign = this.wxPaySign(payment, key)

    // 回复微信
    const return_code = paymentSign === selfSign ? 'SUCCESS' : 'FAIL'
    const reply = { xml: { return_code } }

    return convert.js2xml(reply, {
      compact: true
    })
  }

  /**
   * @description
   * 1. sort 对数据安装字段名进行排序
   * 2. querystring 对数据进行格式转换 key=value&
   * 3. key 在 querystring 最后加上微信后台设置的 key
   * 4. md5 加密
   * 5. toUpperCase 把数据格式化为大写
   */
  wxPaySign(data, key) {
    const sortedOrder = Object.keys(data).sort()
      .reduce((accumulator, key) => {
        accumulator[key] = data[key]
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
