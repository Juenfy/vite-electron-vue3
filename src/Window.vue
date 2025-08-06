<script setup lang="ts">
import tvNavbar from './components/layout/tv-navbar.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
    <div>
        <tv-navbar :isWindow="true" />
        <main class="w-full flex flex-col h-[100vh]">
            <div class="w-full h-[4rem] bg-transparent"></div>
            <div class="flex-1 flex w-full overflow-hidden">
                <router-view :key="route.fullPath"></router-view>
            </div>
        </main>
    </div>
</template>