<template>
    <div class="message-input-x" >
      <el-switch
        v-model="localModel"
        class="ml-2"
        inline-prompt
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949;margin-top: auto;margin-bottom: 1%;"
        active-text="本地"
        inactive-text="远程"
      />
      <el-input
        v-model="newMessage"
        ref="textareaRef"
        :autosize="{ minRows: 1, maxRows: 10 }"
        type="textarea"
        placeholder="请输入 ..."
        @keyup.enter="handleKeyUpEnter"
        
      />
      <div style="margin-top: auto;margin-bottom: 1%;">
        <el-row>
          <button @click="drawer = true"><el-icon><Menu /></el-icon></button>
        </el-row>
        <el-row style="margin-top: 10%;margin-bottom: 15%;">
          <button @click="sendMessage"><el-icon><Promotion /></el-icon></button>
        </el-row>
      </div>
    </div>


    <el-drawer 
      v-model="drawer" 
      :with-header="true"
      :size="isMobile ? '60%' : '30%'"
    >
      <template #header>
        <span style="color: var(--text-color); font-size: 20px;">༄ 对话</span>
      </template>
      <div
        v-for="(message, index) in messages"
      >
        <el-card 
          class="custom-card"
          :class="{
            'active': chat_id === index, 
            'no-active': chat_id !== index, 
          }"
        >
          <!-- <template #header> -->
            <div class="card-header">
              <span style="color: var(--text-color)">☘︎ 对话 {{ index }} </span>
              <el-button 
                type="danger" 
                circle
                @click="del(index)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          <!-- </template> -->
          <!-- <img 
            :src="'https://www.dmoe.cc/random.php?rand=' + randnum + index"
            alt="wallpaper"
            class="scaled-image" 
            @click="chat_id=index; drawer = false"
          /> -->
        </el-card>
      </div>
      <div style="align-items: center;display: flex;justify-content: center;margin-top: 2%;">
      <el-button 
        type="danger" 
        circle
        @click="add"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
      </div>
    </el-drawer>


    <el-drawer 
      v-model="localModel" 
      direction="ltr"
      :with-header="true"
      :size="isMobile ? '60%' : '30%'"
    >
      <template #header>
        <h4>模型选择</h4>
      </template>
      <template #default>
        <div
          v-for="(message, index) in models"
        >
          <el-card 
            class="custom-card"
            :class="{
              'active': model_id === message, 
              'no-active': model_id !== message, 
            }"
            @click="loadmodel(index)"
          > {{message}}</el-card>
        </div>     

      </template>
      <template #footer>
        <span style="font-size: 8px;">
        所有模型存储于 internal storage directory 的 saves 目录下
        </span>
      </template>
    </el-drawer>

</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Menu, Promotion, Plus, Close, Loading} from '@element-plus/icons-vue';
import { useStore } from 'vuex'; // 引入 Vuex store
import { computed } from "vue";
import { model, base_url } from "./store/config";
import axios from "axios";
import { ElMessage, ElLoading } from "element-plus";

const store = useStore(); // 使用 Vuex store
const messages = computed(() => store.state.messages);
const chat_id = computed({
  get: () => store.state.chat_id,
  set: (value) => {
    store.commit("updateChatId", value);
  },
})
const model_id = ref('')
const models = [
  "Qwen/Qwen2.5-0.5B-Instruct", "Qwen/Qwen2.5-1.5B-Instruct", "Qwen/Qwen2.5-3B-Instruct"
]

const add = () => {
  store.dispatch('createNewMes');
};

const del = (index: number) => {
  store.dispatch('deleteMes', index);
};

// 用于存储输入内容
const newMessage = ref('');
const drawer = ref(false)
const isMobile = ref(false)
const randnum = ref(Math.random())
const localModel = ref(false)
const loading = ref(false);
const loadmodel = (index) => {
  // 向 127.0.0.1:5000/chat-start 发送请求
  if (loading.value == false) {
    loading.value = true;
    axios.post('http://127.0.0.1:5000/chat-start', {
      model_name: models[index],
    }).then((response) => {
      model_id.value = models[index];
      console.log(response.data);
      base_url.value = "http://127.0.0.1:5000/";
      model.value = model_id.value;
      ElMessage.success('模型加载成功');
      loading.value = false;
    }).catch((error) => {
      ElMessage.error('模型加载失败');
      loading.value = false;
    });
  }
}

onMounted(() => {
  isMobile.value = window.innerWidth < 768
})
// 发送消息并清空输入框
const emit = defineEmits(['sendMessage']);
function sendMessage() {
    if (newMessage.value.trim()) {  // 使用 .value 获取 sendmes 的值
        emit('sendMessage', newMessage.value);
        newMessage.value = ''; // 清空输入框
    }
}


function handleKeyUpEnter(event: KeyboardEvent) {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent); // Check if the user is on a mobile device
  
  if (event.shiftKey) {
    // Shift + Enter: Add line break
    event.preventDefault();
    // Your logic to insert a line break
  } else {
    if (isMobile) {
      // On mobile, Enter is used for line break
      // Do nothing or insert a line break
    } else {
      // On desktop, Enter sends the message
      sendMessage();
      event.preventDefault();  // Prevent default behavior to avoid line break
    }
  }
}


</script>

<style scoped>
.message-input-x {
    display: flex;
    width: 100%;
    gap: 20px;
    height: 100%;
    padding: 1%;
    margin-top: auto;
    align-items: center;
    background-color: var(--bg-color);
    opacity: 0.5;
}

.custom-card {
    margin-bottom: 4%;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2); /* 半透明背景 */
    backdrop-filter: blur(10px); /* 毛玻璃效果 */
    -webkit-backdrop-filter: blur(10px); /* 兼容 Safari */
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.1); /* 阴影效果 */
    font-size: 12px;
}

.card-header {
  justify-content: space-between;
  align-items: center;
  display: flex;
}
/* 
.message-input-x el-input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    resize: none;
    background-color: var(--bg-color);
    color: var(--text-color);
    margin-top: auto;
    margin-bottom: 2%;
} */

.scaled-image {
  height: 10vh; /* 设置高度为视口高度的 10% */
  width: auto;  /* 宽度自动，保持纵横比 */
  object-fit: cover; /* 保持图片内容的填充效果，裁剪多余部分 */
  opacity: 0.7;
  border-radius: 5px
}

.message-input-x button {
  background-color: rgb(138, 95, 230);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;  
  margin-top: auto;
  margin-bottom: 2%;
}

.message-input-x .el-textarea :deep(.el-textarea__inner) {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: none;
  margin-top: auto;
}

html[data-theme="light"] {
  .active {
    background-color: #f8f3d4;
  }

  .no-active {
    background-color: white;
  }
}

html[data-theme="dark"] {
  .active {
    background-color: #522546;
  }

  .no-active {
    background-color: rgba(0, 0, 0, 0.2);
  }
}


</style>
  