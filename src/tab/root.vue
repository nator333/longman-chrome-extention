<template lang="pug">
    div {{ __('tab') }}
</template>
<script>
  const __ = chrome.i18n.getMessage

  export default {
    data: () => ({
    }),
    computed: { },
    created () {
      console.log(__('tab'))
    },
    mounted () { },
    methods: { }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>
