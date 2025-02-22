<template>
    <div class="chat-window">
        <!-- 消息列表 -->
        <div class="message-list">
            <el-scrollbar ref="scrollbar">
                <MessageList />
            </el-scrollbar>
        </div>

        <!-- 输入框 -->
        <div class="message-input">
            <MessageInput  @sendMessage="sendMessage" />
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, nextTick, watchEffect } from 'vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import { GetResponse, check_params } from './utils/api';
import { model, max_tokens, temp_, top_p, api_key, base_url } from './store/config';
import { computed } from 'vue';
import { useStore } from 'vuex'; // 引入 Vuex store

const store = useStore(); // 使用 Vuex store
// messages 是一个对象，保存所有聊天记录
const chat_id = computed(() => store.state.chat_id);
const temp = computed(() => store.state.messages);
const messages = computed(() => temp.value[chat_id.value]);

// 获取 el-scrollbar 组件实例的引用
const scrollbar = ref(null);
// 监听 messages 的变化，当消息新增时自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollbar.value) {
      scrollbar.value.setScrollTop(scrollbar.value.wrapRef.scrollHeight);
    }
  });
};
const activeName = ref("1");

async function sendMessage(mes: string) {
  if (!mes) return;
  
  // 添加用户消息
  store.dispatch('addMessage', {
    role: 'user',
    content: mes,
    time: new Date().toLocaleTimeString(),
  });

  // 强制 Vue 渲染更新
  await nextTick();

  // 清理消息，只保留必要的字段
  const cleanMessages = messages.value.map(({ time, ...rest }) => rest);
  // 参数检查
  const out = check_params(
    model.value,
    max_tokens.value,
    temp_.value,
    top_p.value,
    api_key.value
  );
  
  if (!out[0]) {
    console.log(out[1]);
    return;
  }

  // 请求 OpenAI 流式 API
  const responseStream = await GetResponse(
    cleanMessages,
    model.value,
    max_tokens.value,
    temp_.value,
    top_p.value,
    api_key.value,
    base_url.value
  );

  if (!responseStream) {
    store.dispatch('addMessage', {
      role: 'assistant',
      content: '对不起，小助手出了点问题',
      time: new Date().toLocaleTimeString(),
    });
    scrollToBottom();
    return;
  }

  // 新增一条“助手”消息，初始内容为空
  let assistantMessage = {
    role: 'assistant',
    content: '',
    time: new Date().toLocaleTimeString(),
  };
  messages.value.push(assistantMessage);

  const currentAssistantMessage = messages.value[messages.value.length - 1];

  // 假设 responseStream 是一个异步可迭代对象
  let sep: boolean = false
  console.log(responseStream, ">>>>>>>>>>>>>");
  for await (const response of responseStream) {
    // 更新助手消息内容
    console.log(response, "<<<<<<<<<<<<<<");
    if (!sep && response.choices[0]?.delta?.reasoning_content) {
      sep = true
      currentAssistantMessage.content += "<blockquote>";
    }
    if (sep && response.choices[0]?.delta?.content) {
      currentAssistantMessage.content += "</blockquote>\n\n";
      sep = false
    }
    currentAssistantMessage.content += response.choices[0]?.delta?.reasoning_content || "";
    currentAssistantMessage.content += response.choices[0]?.delta?.content || "";
    // 强制 Vue 渲染更新
    await nextTick();
    scrollToBottom();
  }
}
</script>


<style scoped>
.chat-window {
    width: auto;
    height: 100%;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: hidden; 
    display: flex;
    flex-direction: column;
}

.message-list {
    overflow-y: auto;
    flex: 1;
}

.message-input {
    display: flex;
    width: 100%;
    min-height: 5%;
    margin-top: auto;
}

.message-input input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .message-input {
    min-height: 5%;
    margin-bottom: 2%;
  }
  .chat-window {
    box-shadow: none;
  }
}
</style>