<script lang="ts" setup>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
import { ref } from 'vue';
import LLMChat from './subviews/llmchat/LLMChat.vue';
import LLMChatConfig from './subviews/llmchat/LLMChatConfig.vue';
import { ChatDotRound , More, Refresh, MagicStick } from '@element-plus/icons-vue';
import SysConfig from './subviews/systemconfig/SysConfig.vue';
import Dev from './subviews/dev/Dev.vue';


const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const currentTab = ref<string>('1');
const url = ref<string>('https://www.loliapi.com/acg/pc/');

</script>

<template>
    <el-container class="common-layout">
      <el-header class="header" style="display: flex;align-items: center;justify-content: space-between;">
        <!-- 手机端才使用 -->
        <el-button 
          color="black" 
          class="mobile-only" 
          circle
          @click="currentTab = '1'"
          v-show="currentTab !== '1'"
        >
          <el-icon><More /></el-icon>
        </el-button>
        <h2 style="color: --text-color">DGMEの工具箱</h2>
      </el-header>
      <el-container class="main">
        <el-aside class="aside_bar" :class="{
            'aside-collapsed': currentTab !== '1', 
            'aside-open': currentTab === '1'
          }">
            <h3 class="mb-2">工具</h3>
            <el-menu
                active-text-color="#ffd04b"
                background-color="#545c64"
                class="el-menu-vertical-demo"   
                default-active="2"
                text-color="#fff"
                @open="handleOpen"
                @close="handleClose"
            >
                <el-sub-menu index="1" style="text-align: center;">
                    <template #title>
                        <el-icon><icon-menu /></el-icon>
                        <span class="menu-text">LLM Chat</span>
                    </template>
                    <el-menu-item index="1-1" @click="currentTab = 'chat'">
                      <el-icon><ChatDotRound /></el-icon>
                      <span class="menu-text">聊天</span>
                    </el-menu-item>
                    <el-menu-item index="1-1" @click="currentTab = 'chat_option'">
                      <el-icon><Setting /></el-icon>
                      <span class="menu-text">设置</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item index="2" @click="currentTab = 'config'">
                  <el-icon><Setting /></el-icon>
                  <span class="menu-text">全局设置</span>
                </el-menu-item>
                <el-menu-item index="3" @click="currentTab = 'dev'">
                  <el-icon><MagicStick /></el-icon>
                  <span class="menu-text">Dev</span>
                </el-menu-item>
            </el-menu>
        </el-aside>    
        <el-container style="flex-direction: column;height: 100%;">
            <el-main 
              class="main-with-border"
              :style="{
                backgroundImage: `url(${url})`,
              }"
            >
                <LLMChat v-show="currentTab === 'chat'"/>
                <LLMChatConfig v-show="currentTab === 'chat_option'"/>
                <SysConfig v-show="currentTab === 'config'"/>
                <Dev v-show="currentTab === 'dev'"/>
            </el-main>
            <el-footer class="footer-right" 
              :class="{
                'footer-right-close': currentTab === '1',
                'footer-right-open': currentTab !== '1'
              }">
              <el-button 
                :icon="Refresh" 
                circle 
                @click="url = `https://www.loliapi.com/acg/pc/?cache_bust=${new Date().getTime()}`;;console.log('刷新背景')" 
                style="margin-right: 2%;"
              />背景刷新
            </el-footer>
        </el-container>
      </el-container>
    </el-container>
</template>
<style scoped>
.common-layout {
    height: 100%; /* 让整个页面高度占满视口 */
}

.header {
    width: 100%;
    border-bottom: 2px solid #ddd; /* 2px 灰色分割线 */
    text-align: left;
    flex: 1;
}

.main {
    width: 100%;
    height: 90%;
}

.main-with-border {
    /* 背景图片设置 */
    flex: 1;
    background-image: url('https://www.loliapi.com/acg/pc/'); /* 替换成你的图片路径 */
    background-size: cover; /* 让图片覆盖整个容器 */
    background-position: center; /* 居中显示图片 */
    
    /* 设置背景透明度 */
    background-color: rgba(var(--bg-color-rgb), 0.7 ); /* 透明度效果 */
    background-blend-mode: overlay; /* 混合模式，使背景图片和颜色叠加 */
    

    backdrop-filter: blur(10px); /* 背景模糊 */
    -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
    border-top: none;
    text-align: left;
    overflow: auto;

}

.footer-right {
    display: flex; /* 启用 Flexbox */
    justify-content: flex-end; /* 内容靠右对齐 */
    align-items: center; /* 垂直居中（如果需要） */
    position: relative;
    bottom: 0;
    height: 6%;
}

.aside_bar {
    width: 15%;
    text-align: center;
    background-image: url("/src/assets/logo.png");
    background-size: contain; 
    background-position: center; /* 居中显示图片 */
    background-repeat: no-repeat;
    background-blend-mode: overlay; /* 混合模式，使背景图片和颜色叠加 */
    backdrop-filter: blur(10px); /* 背景模糊 */
    background-color: rgba(var(--bg-color-rgb), 0.5); /* 透明度效果 */
    -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
}

@media (max-width: 768px) {
  .menu_text {
    display: none; /* 隐藏菜单项文字 */
  }

  .el-menu .el-sub-menu .el-menu-item {
    display: flex; /* 保持菜单项在同一行 */
    align-items: left;
  }

  .el-menu .el-sub-menu .el-menu-item .el-icon {
    margin-right: 8px; /* 给图标和文本之间加个间隔 */
  }

  .main-with-border {
    padding: 0%;
  }
}


@media (max-width: 768px) {
  .aside_bar {
    width: 100%;
  }
  .aside-collapsed {
    width: 0% !important;
    transition: width 0.3s ease-in-out;
  }
  .aside-open {
    width: 100% !important;
    transition: width 0.3s ease-in-out;
  }
  .footer-right-close {
    display: none;
  }
  .footer-right-open {
    display: flex;
  }
}

@media (min-width: 768px) {
  .mobile-only {
    display: none; /* 隐藏按钮 */
    padding: 0%;
  }
}
</style>
