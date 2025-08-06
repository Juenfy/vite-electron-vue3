import router from '../router'
function isElectron() {
  return typeof window !== 'undefined' && !!window.ipcRenderer
}

function routerPushOrOpenWindow(name: string, query?: any, params?: any) {
  if (isElectron()) {
    const routeLocation = router.resolve({
      name: 'win-' + name, // 路由名称
      params, // 路由参数（如:id）
      query, // URL查询参数（如?page=1）
    })
    const uri = import.meta.env.DEV
      ? location.origin + '/' + routeLocation.href
      : routeLocation.href
    console.log('打开新窗口', uri)
    window.ipcRenderer.send('window-action', {
      action: 'create',
      name,
      uri,
    })
  } else {
    router.push({
      name,
      query,
      params,
    })
  }
}

export { isElectron, routerPushOrOpenWindow }
