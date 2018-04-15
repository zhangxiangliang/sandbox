const Env = use('Env')

module.exports = {
  appid: Env.get('WXPAY_APP_ID'),
  mch_id: Env.get('WXPAY_MCH_ID'),
  key: Env.get('WXPAY_KEY'),
  notify: Env.get('WXPAY_NOTIFY_URL')
}
