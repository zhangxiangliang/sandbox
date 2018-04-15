'use strict'

const Config = use('Config')
const moment = use('moment')

class CheckoutController {
  /**
   * @param out_trade_no 商户订单号
   * @param body 商品描述
   * @param total_fee 商品价格（单位：分）
   * @param trade_type 支付类型
   * @param product_id 商品 ID
   */
  render ({ view }) {
    const appid = Config.get('wxpay.appid')
    const mch_id = Config.get('wxpay.mch_id')
    const key = Config.get('wxpay.key')

    const out_trade_no = moment().local().format('YYYYMMDDHHmmss')
    const body = 'adonis'
    const total_fee = 3
    const trade_type = "NATIVE"
    const product_id = 1

    return view.render('commerce.checkout')
  }
}

module.exports = CheckoutController
