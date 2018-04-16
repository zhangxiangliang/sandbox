const Env = use('Env')

module.exports = {
  // 公众号 ID
  appid: Env.get('WXPAY_APP_ID'),

  // 商户号
  mch_id: Env.get('WXPAY_MCH_ID'),

  // 密钥
  key: Env.get('WXPAY_KEY'),

  // 通知地址
  notify: Env.get('WXPAY_NOTIFY_URL'),

  // 接口地址
  api: {
    unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder'
  }

}
