<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { isElectron } from '../../utils/help'
import { Modal } from 'flowbite'

defineProps<{
    isWindow?: boolean | false
}>()

const route = useRoute()
const maximize = ref(false)
const exitConfirmModal = ref()
const exitHide = ref(false)
const startMouseX = ref(0)
const startMouseY = ref(0)
const windowAction = (action: string, data?: any) => {
    if (action === 'maximize') maximize.value = true
    if (action === 'unmaximize') maximize.value = false


    if (action === 'close') {
        //只有主窗口才需要确认退出
        if (route.name === 'home') {
            exitConfirmModal.value.show()
            return
        } else {
            action = 'exit'
            data = { hide: exitHide.value }
        }
    }
    window.ipcRenderer.send('window-action', {
        name: route.name,
        action: action,
        ...data
    })
}

const initExitConfirmModal = () => {
    const modalElement = document.getElementById('exitConfirmModal')
    if (modalElement) {
        exitConfirmModal.value = new Modal(modalElement, {
            backdrop: 'dynamic',
            backdropClasses: 'bg-gray-900/60 fixed inset-0 z-40',
            closable: true
        })
    }
}

const confirmExit = () => {
    if (exitConfirmModal.value) {
        exitConfirmModal.value.hide()
    }
    windowAction('exit', { hide: exitHide.value })
}

const onMouseDown = (e: MouseEvent) => {
    const tagName = (e.target as HTMLElement)?.tagName
    if (e.button === 0 && tagName === 'DIV') {
        // 仅左键点击有效
        startMouseX.value = e.screenX
        startMouseY.value = e.screenY
        windowAction('mousedown')
    }
}

const onMouseMove = (e: MouseEvent) => {
    if (startMouseX.value > 0) {
        windowAction('mousemove', { deltaX: e.screenX - startMouseX.value, deltaY: e.screenY - startMouseY.value })
    }
}
const onMouseUp = () => {
    startMouseX.value = 0
    startMouseX.value = 0
    windowAction('mouseup')
}

const focusHome = () => {
    window.ipcRenderer.send('window-action', { name: 'home', action: 'focus' })
}

onMounted(() => {
    initExitConfirmModal()
})
</script>
<template>
    <nav class="text-white fixed flex justify-between bg-green-500 w-full h-[4rem] top-0 left-0 px-4"
        @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp">
        <div v-if="isElectron() && isWindow" class="flex justify-center items-center space-x-2">
            <button class="svg-btn-hover" @click="focusHome()" title="返回主界面">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6797" width="20"
                    height="20" fill="currentColor">
                    <path
                        d="M923.733333 394.666667c-85.333333-70.4-206.933333-174.933333-362.666666-309.333334C533.333333 61.866667 490.666667 61.866667 462.933333 85.333333c-155.733333 134.4-277.333333 238.933333-362.666666 309.333334-14.933333 14.933333-25.6 34.133333-25.6 53.333333 0 38.4 32 70.4 70.4 70.4H192v358.4c0 29.866667 23.466667 53.333333 53.333333 53.333333H405.333333c29.866667 0 53.333333-23.466667 53.333334-53.333333v-206.933333h106.666666v206.933333c0 29.866667 23.466667 53.333333 53.333334 53.333333h160c29.866667 0 53.333333-23.466667 53.333333-53.333333V518.4h46.933333c38.4 0 70.4-32 70.4-70.4 0-21.333333-10.666667-40.533333-25.6-53.333333z m-44.8 59.733333h-57.6c-29.866667 0-53.333333 23.466667-53.333333 53.333333v358.4h-138.666667V661.333333c0-29.866667-23.466667-53.333333-53.333333-53.333333h-128c-29.866667 0-53.333333 23.466667-53.333333 53.333333v206.933334H256V507.733333c0-29.866667-23.466667-53.333333-53.333333-53.333333H145.066667c-4.266667 0-6.4-2.133333-6.4-6.4 0-2.133333 2.133333-4.266667 2.133333-6.4 85.333333-70.4 206.933333-174.933333 362.666667-309.333333 4.266667-4.266667 10.666667-4.266667 14.933333 0 155.733333 134.4 277.333333 238.933333 362.666667 309.333333 2.133333 2.133333 2.133333 2.133333 2.133333 4.266667 2.133333 6.4-2.133333 8.533333-4.266667 8.533333z"
                        fill="currentColor"></path>
                </svg>
            </button>
        </div>
        <div class="flex-1"></div>
        <div v-if="isElectron()" class="flex justify-center items-center space-x-2">
            <button class="svg-btn-hover" @click="windowAction('minimize')">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor">
                    <path
                        d="M863.7 552.5H160.3c-10.6 0-19.2-8.6-19.2-19.2v-41.7c0-10.6 8.6-19.2 19.2-19.2h703.3c10.6 0 19.2 8.6 19.2 19.2v41.7c0 10.6-8.5 19.2-19.1 19.2z">
                    </path>
                </svg>
            </button>
            <button class="svg-btn-hover" @click="windowAction('maximize')" v-if="!maximize">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor">
                    <path
                        d="M770.9 923.3H253.1c-83.8 0-151.9-68.2-151.9-151.9V253.6c0-83.8 68.2-151.9 151.9-151.9h517.8c83.8 0 151.9 68.2 151.9 151.9v517.8c0 83.8-68.1 151.9-151.9 151.9zM253.1 181.7c-39.7 0-71.9 32.3-71.9 71.9v517.8c0 39.7 32.3 71.9 71.9 71.9h517.8c39.7 0 71.9-32.3 71.9-71.9V253.6c0-39.7-32.3-71.9-71.9-71.9H253.1z">
                    </path>
                </svg>
            </button>
            <button class="svg-btn-hover" @click="windowAction('unmaximize')" v-else>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor">
                    <path
                        d="M256 85.333333h682.666667v682.666667h-85.333334v85.333333h85.333334c46.933333 0 85.333333-38.4 85.333333-85.333333V85.333333c0-46.933333-38.4-85.333333-85.333333-85.333333H256C209.066667 0 170.666667 38.4 170.666667 85.333333v85.333334h85.333333V85.333333z"
                        fill="currentColor"></path>
                    <path
                        d="M768 170.666667H85.333333C38.4 170.666667 0 209.066667 0 256v682.666667c0 46.933333 38.4 85.333333 85.333333 85.333333h682.666667c46.933333 0 85.333333-38.4 85.333333-85.333333V256c0-46.933333-38.4-85.333333-85.333333-85.333333z m0 768H85.333333V256h682.666667v682.666667z"
                        fill="currentColor"></path>
                </svg>
            </button>
            <button class="svg-btn-hover" @click="windowAction('close')">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    fill="currentColor">
                    <path
                        d="M571.01312 523.776l311.3472-311.35232c15.7184-15.71328 15.7184-41.6256 0-57.344l-1.69472-1.69984c-15.7184-15.71328-41.6256-15.71328-57.34912 0l-311.3472 311.77728-311.35232-311.77728c-15.7184-15.71328-41.63072-15.71328-57.344 0l-1.69984 1.69984a40.0128 40.0128 0 0 0 0 57.344L452.92544 523.776l-311.35232 311.35744c-15.71328 15.71328-15.71328 41.63072 0 57.33888l1.69984 1.69984c15.71328 15.7184 41.6256 15.7184 57.344 0l311.35232-311.35232 311.3472 311.35232c15.72352 15.7184 41.63072 15.7184 57.34912 0l1.69472-1.69984c15.7184-15.70816 15.7184-41.6256 0-57.33888l-311.3472-311.35744z">
                    </path>
                </svg>
            </button>
        </div>
    </nav>
    <div id="exitConfirmModal" tabindex="-1"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative p-4 w-full max-w-md max-h-full">
            <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                <div class="p-4 md:p-5 text-center">
                    <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        确定要退出应用吗?
                    </h3>
                    <div class="flex items-start justify-center mb-5">
                        <div class="flex items-center">
                            <input id="minimize" type="checkbox" v-model="exitHide"
                                class="w-6 h-6 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" />
                        </div>
                        <label for="minimize"
                            class="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">最小化到托盘</label>
                    </div>
                    <button @click="confirmExit()" type="button" class="green-btn mr-2">
                        确定
                    </button>
                    <button @click="exitConfirmModal.hide()" type="button" class="red-btn">
                        取消
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>