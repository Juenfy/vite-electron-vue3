<script setup lang="ts">
import tvSidebar from './tv-sidebar.vue';
</script>
<template>
    <main class="w-full flex flex-col h-[100vh]">
        <div class="w-full h-[4rem] bg-transparent"></div>
        <div class="flex-1 flex w-full overflow-hidden">
            <tv-sidebar />
            <div class="flex-1 overflow-x-hidden overflow-y-scroll bg-blue-500">
                <slot></slot>
            </div>
        </div>
    </main>
</template>