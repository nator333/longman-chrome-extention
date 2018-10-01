import Vue from 'vue'
import root from './root.vue'
Vue.config.productionTip = false

// used in Vue rendering
Vue.prototype.__ = chrome.i18n.getMessage

new Vue({ // eslint-disable-line no-new
  el: '#root',
  render: h => h(root)
})
