chrome.contextMenus.create({title: 'hoge'}, function () {
  alert('コンテキストメニュー登録完了')
})

chrome.contextMenus.onClicked.addListener(function () {
  alert('onClickedイベントでクリック')
})
