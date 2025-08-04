import router from '../router'
function isElectron() {
  return typeof window !== 'undefined' && !!window.ipcRenderer
}

function routerPushOrOpenWindow(name: string, query?: any, params?: any) {
  if (isElectron()) {
    const routeLocation = router.resolve({
      name, // 路由名称
      params, // 路由参数（如:id）
      query, // URL查询参数（如?page=1）
    })
    const url = location.origin + '/' + routeLocation.href
    window.ipcRenderer.send('window-action', {
      action: 'create',
      name,
      url,
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
