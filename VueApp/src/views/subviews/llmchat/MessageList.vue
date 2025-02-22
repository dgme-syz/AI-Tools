<template>
  <div class="message-list">
    <el-scrollbar>
      <div 
        v-for="(message, index) in messages" 
        :key="message.id || index" 
        class="message-bubble-container" 
        :class="message.role"
        v-show="message.role !== 'system'"  
      >
        <!-- 头像部分 -->
        <div class="avatar">
          <!-- 如果当前消息角色在 avatarDictionary 中不存在，则使用 default -->
          <img :src="avatarDictionary[message.role] || avatarDictionary.default" alt="Avatar" />
        </div>
        <!-- 消息气泡部分 -->
        <div class="message-bubble">
          <el-dropdown trigger="contextmenu" ref="dropdown">
            <div 
              class="message-content" 
              v-html="parseMarkdown(message.content)"
              @touchstart="handleTouchStart"
            ></div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="Edit" @click="openContextMenu(index)">修改</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </el-scrollbar>
  </div>

  <!-- 修改对话框 -->
  <el-dialog 
    v-model="visible" 
    :show-close="false" 
    destroy-on-close
    :width=dialog_width
  >
    <template #header="{ titleId, titleClass }">
      <div class="my-header" style="display: flex; align-items: center; justify-content: space-between;">
        <h4 :id="titleId" :class="titleClass">修改</h4>
        <el-button type="danger" @click="closeDialog">
          <el-icon class="el-icon--left">
            <CircleCloseFilled />
          </el-icon>
          Close
        </el-button>
      </div>
    </template>
    <el-input 
      v-model="Newcontent" 
      type="textarea" 
      :rows=5 
    />
    <div style="display: flex; flex-direction: row-reverse; margin-top: 2%;">
      <el-button type="primary" @click="update">确定</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">

import { parseMarkdown } from "./utils/textdecode.ts"
import Prism from "prismjs"; // 引入插件
import 'prismjs/themes/prism.css'; // 引入样式
import { onMounted, onUpdated , onBeforeMount} from 'vue';
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
import './CustomCss/spring.css'
import { CircleCloseFilled, Edit } from '@element-plus/icons-vue'
import type { DropdownInstance } from 'element-plus'
// `defineProps` is no longer needed to be imported in Vue 3 with `<script setup>`

// 响应式变量
const dropdown = ref<DropdownInstance>();
const visible = ref(false);
const ind = ref(0);
const Newcontent = ref("");

// 使用 Vuex store
const store = useStore();

// 计算属性：图片 URL（支持双向绑定）
const Image = computed({
  get: () => store.state.url,
  set: (value) => {
    store.commit("updateUrl", value);
  },
});

const dialog_width = ref("50%");
// 计算属性：当前聊天对应的消息列表（添加防护以防为空）
const messages = computed(() => store.state.messages[store.state.chat_id] || []);

// 代码高亮：初次加载和每次更新后执行
onBeforeMount(() => {
  console.log(dialog_width.value);
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    dialog_width.value = "90%";
  }
})
onMounted(() => {
  Prism.highlightAll();
});
onUpdated(() => {
  Prism.highlightAll();
});

// 计算属性：头像字典，根据不同角色返回不同头像
const avatarDictionary = computed(() => {
  return {
    user: 'https://avatars.githubusercontent.com/u/97904453?s=400&u=75800af3a0014b0b599610968cd8f823ebe515e7&v=4',
    assistant: Image.value, // 响应 store.state.url 的变化
    default: '/path/to/default-avatar.jpg',
  };
});

// 方法：右键事件，打开修改对话框并记录点击消息的索引
const openContextMenu = (index: number) => {
  visible.value = true;
  ind.value = index;
  // 如果需要修改，预先将当前消息内容赋值到 Newcontent 中
  Newcontent.value = messages.value[index].content;
};

// 方法：关闭对话框，并重置编辑内容
const closeDialog = () => {
  visible.value = false;
  Newcontent.value = "";
};

// 方法：更新消息内容，调用 Vuex mutation 修改状态
const update = () => {
  console.log(messages);
  store.commit("updateContent", { index: ind.value, newContent: Newcontent.value }); // 传递对象
  visible.value = false;
  Newcontent.value = "";
};


let touchStartTime = 0;

const handleTouchStart = (event) => {
  if (!dropdown.value)
    return 

  touchStartTime = Date.now(); // 记录触摸开始的时间
  console.log(dropdown.value.handleOpen);
  
  // 在此触发其他同步逻辑
  const currentTime = Date.now();
  const elapsedTime = currentTime - touchStartTime;
  
  if (elapsedTime >= 500) { // 如果触摸超过 500ms，则执行 handleOpen
    if (dropdown.value && typeof dropdown.value.handleOpen === 'function') {
      dropdown.value.handleOpen();
    }
  }
};


</script>

<style scoped>
.message-bubble {
  padding: 10px;
  border-radius: 10px;
  max-width: 75%;
}

.message-bubble-container {
  display: flex;
  gap: 10px;
  margin-bottom: 10px; /* 可选：为每条消息添加下边距 */
}

.message-list {
  display: flex;
  flex-direction: column; /* 垂直排列消息 */
}

.user {
  flex-direction: row-reverse; /* 用户消息：头像在右侧 */
}

.assistant {
  flex-direction: row; /* 机器人消息：头像在左侧 */
}

.user .message-bubble { 
  background-color: white;
  color: black;
  align-self: flex-end;  /* 消息右对齐 */
  text-align: left;
  margin-top: 1%;
}

.assistant .message-bubble {
  background-color: white;
  color: black;
  align-self: flex-start;  /* 消息左对齐 */
  text-align: left;
  margin-top: 1%;
}

.message-content {
  font-size: 14px;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  text-align: right;
  color: deeppink;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.katex {
  font-size: 1.2em;
  display: block;
  margin-top: 5px;
}
</style>
