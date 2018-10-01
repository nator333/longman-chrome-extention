<template lang="pug">
    div {{ __('content') }}
</template>
<script>
  const __ = chrome.i18n.getMessage

  export default {
    data: () => ({}),
    computed: {},
    created () {
      alert('created')
      console.log(__('content'))
    },
    mounted () {
      // Define Tooltip element
      let divElm = document.createElement('div')
      let divIconElm = document.createElement('div')
      divElm.classList.add('long-man-icon')
      divIconElm.classList.add('long-man-dict')
      divElm.appendChild(divIconElm)
      let body = document.body
      let voidVal = void 0
      let notMinusOne = !1

      body.onmouseup = function (content) {
        if (voidVal && content.target !== voidVal) return void (body.removeChild(voidVal) && (voidVal = null))
        setTimeout(function () {
          let voidVal = void 0
          let selectionObj = window.getSelection()
          let selectionText = selectionObj.toString()
            .replace(/[.*?;!()+,[:<>^_`[]{}~\/"'=]/g, ' ')
            .trim()
          let rectObj = document.body.parentNode.getBoundingClientRect()
          let minusOne = -1
          let documentElementObj = document.documentElement
          let urlText = 'https://dictionary.cambridge.org/search/'
          let st450 = 450
          let st300 = 300

          notMinusOne && body.removeChild(divElm) && (notMinusOne = !1)

          if (selectionText && content.target !== divElm && !selectionText.includes(' ')) {
            voidVal = selectionObj.getRangeAt(0).getBoundingClientRect()
            Math.abs(content.clientY - voidVal.top) > voidVal.bottom - content.clientY && (minusOne = voidVal.height + 28)
            divElm.style.top = voidVal.bottom - rectObj.top - minusOne + 'px'
            divElm.style.left = content.clientX + documentElementObj.scrollLeft - 12 + 'px'

            divElm.onclick = function (clickedObj) {
              body.removeChild(divElm) && (notMinusOne = !1)
              clickedObj.stopPropagation()
              clickedObj.preventDefault()

              let inBetween = voidVal.bottom - divElm.top - minusOne
              inBetween - documentElementObj.scrollTop < st300 ? inBetween += 27
                : inBetween + st300 > documentElementObj.scrollTop && (inBetween -= st300)

              let iframeObj = document.createElement('iframe')
              iframeObj.src = urlText + '?q=' + selectionText.toLocaleLowerCase()
              iframeObj.width = st450 + 'px'
              iframeObj.height = st300 + 'px'
              iframeObj.style.zIndex = 999999999
              iframeObj.style.position = 'absolute'
              iframeObj.style.top = inBetween + 'px'
              content.clientX + st450 > body.clientWidth ? iframeObj.style.left = body.clientWidth + documentElementObj.scrollLeft - st450 + 'px' : iframeObj.style.left = content.clientX + documentElementObj.scrollLeft - 10 + 'px'
              body.appendChild(iframeObj)
              console.log(iframeObj.src)
            }

            body.appendChild(divElm) && (notMinusOne = !0)
            alert('appended')
          }
        }
        )
      }
    },
    methods: {}
  }
</script>
<style lang="scss">
    .long-man-dict {
        background-color: rgb(245, 245, 245);
        box-sizing: content-box;
        cursor: pointer;
        z-index: 999999;
        position: absolute;
        padding: 3px;
        border: 1px solid rgb(220, 220, 220);
        border-radius: 5px;
        border-image: initial;
    }

    .long-man-dict:hover {
        background-color: rgb(248, 248, 248);
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 1px;
        border: 1px solid rgb(198, 198, 198);
        border-image: initial;
    }

    .long-man-dict-icon {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABjFBMVEUAAAB0RkuUQzOPXkiPW0eHTDmgX16dp6udp6mgWluPRD6QXUiPW0j3kzPYlyDYaDHMMwD/ioTy///0///jcCXohS/QfCKDVkbbcCO+pC+5kzTGYhbl9vrT3ujGShS8oC68njPdYiWSSU7xpyfAnTTRryTCfhXO3uXm+fnPqiLCojXpvCWbOjK/NRS9QQ/w///V5+nENBaPSDOeVlHii4PFyMDDxb7ojYWbV1SLj5H////g6OrT1tvi+/+4fnfSNA3LLg3Ci4ns///Q1dni6Ovy/v/CzNHj7vLf///Wk5LVLhPNKRLkpafm///i7fHAzM/z//+lWV3Semu/tLO7savZf3KiXV2WPDTGfRS6VxvEKwfp//+8LAbGfBTAUx+Pbmblpx+6oy3LkiK4XBOsqbbs9v/PkBK4ni7LliTaeCWaj5rRqyDDrjXNgxrr/P/NdxnKrSTHsy6Yj5qKVlTGiiG3ahTl8/e+ThvMiCV+X1iIW2Dj9vmIYm+2tb+gLi72//+ZOTfAwcy4vMPAxMyBHmItAAAAAXRSTlMAQObYZgAAAAFiS0dEOk4JxPoAAAAHdElNRQfiAgQIMTCMbbK4AAAA40lEQVQY00XK1VIDYRCE0cni3k2A4BLcXTZIILg7wYMs7u7+4swPVPHd9NSpEXFZYeERkVHRMbFx8ZZLRKyExCQw2c2U1DRYCp70jMwsZucwNy+/wKPgLSwqLmFpGVFeUelVqAKqa1hbR9QDDQqN1JqaW1rNtinYvvaOzi5/d0+gt89nG+gfGBwaHhkdG5+YnDIwbV5nZufmzS4oBLG4tMyVAFfX1hFUCG1sbm3T2eHu3v5BSOEQR8cnPHV4dn6BSwW5wvUNnVve3eNBfnoE+OQQeJa/Xl7pfuP7h/z3adtfv9c3Wlko+Fl9+5IAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTgtMDItMDRUMDg6NDk6NDgtMDc6MDCJWyOlAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE4LTAyLTA0VDA4OjQ5OjQ4LTA3OjAw+AabGQAAAABJRU5ErkJggg==);
        background-size: 19px;
        height: 19px;
        width: 19px;
    }
</style>
