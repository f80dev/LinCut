chrome.runtime.onInstalled.addListener(async  ()=> {
  console.log("Installation de du menu contextuel voir ")
  chrome.contextMenus.create(
    {
      "title": "Raccourcir",
      "id": "link_shorter",
      "contexts": ["link"]
    })

  chrome.contextMenus.onClicked.addListener((info,tab)=> {
    chrome.storage.local.set({"url":info.linkUrl})
    //voir https://developer.chrome.com/docs/extensions/reference/api/windows#method-create
    chrome.windows.create({url: "index.html?url="+info.linkUrl, type: "panel"})
    }
  )

})


