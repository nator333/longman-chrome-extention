<template lang="pug">
    div
      el-button(type="warning" @click="tab") New tab
</template>
<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () {
      console.log('New tab')
    },
    mounted () { },
    methods: {
      tab () {
        chrome.contextMenus.create({
          'title': 'テキスト読み上げ',
          'type': 'normal',
          'contexts': ['selection'],
          'onclick': function () {
            return function (info, tab) {
              chrome.tts.speak(info.selectionText)
            }
          }
        })
      }
    }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>
