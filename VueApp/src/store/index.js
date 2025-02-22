// src/store/index.ts
import { createStore } from 'vuex';

/**
 * 一个简单的 Vuex 插件，用于在每次 mutation 后将状态持久化到 localStorage
 */
function persistState(store) {
  store.subscribe((mutation, state) => {
    localStorage.setItem('messages', JSON.stringify(state.messages));
    localStorage.setItem('url', state.url);
    localStorage.setItem('chat_id', state.chat_id.toString());
  });
}

export default createStore({
  state: {
    // 初始化 messages 时尝试从 localStorage 读取，如果不存在则使用默认值
    messages: (() => {
      const stored = localStorage.getItem('messages');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('解析 localStorage 中 messages 数据失败:', error);
        }
      }
      return [
        [
          { role: 'system', content: '你是用户的可爱小助手', time: 'xxx' }
        ]
      ];
    })(),
    url: localStorage.getItem('url') ||
         'https://pic1.imgdb.cn/item/67a5b538d0e0a243d4fc7f8c.jpg',
    chat_id: parseInt(localStorage.getItem('chat_id') || '0'),
  },
  mutations: {
    addMessage(state, message) {
      state.messages[state.chat_id].push(message);
    },
    updateSystemPrompt(state, newContent) {
      // 遍历每个会话，将首条系统消息的 content 更新
      state.messages.forEach(session => {
        if (session.length > 0) {
          session[0].content = newContent;
        }
      });
    },
    updateUrl(state, newUrl) {
      state.url = newUrl;
    },
    updateChatId(state, newChatId) {
      state.chat_id = newChatId;
    },
    createNewMes(state) {
      // 使用当前默认系统消息（复制一份）来创建新的会话
      const systemMessage = { ...state.messages[0][0] }; // 克隆对象，避免引用共享
      console.log(systemMessage);
      state.messages.push([systemMessage]);
    },
    deleteMes(state, id) {
      // 当删除的会话为当前活跃会话时需要调整 chat_id
      if (state.chat_id === id) {
        if (id === 0) {
          // 如果删除的是第一个会话，则重新生成系统消息作为默认会话
          if (state.messages.length === 1) {
            const systemMessage = { ...state.messages[0][0] };
            state.messages.push([systemMessage]);
          }
        } else {
          state.chat_id -= 1;
        }
      } else if (state.chat_id > id) {
        state.chat_id -= 1;
      }
      state.messages.splice(id, 1);
    },
    updateContent(state, { index, newContent }) {
      state.messages[state.chat_id][index].content = newContent;
    },
  },
  actions: {
    addMessage({ commit }, message) {
      commit('addMessage', message);
    },
    createNewMes({ commit }) {
      commit('createNewMes');
    },
    deleteMes({ commit }, id) {
      commit('deleteMes', id);
    }
  },
  getters: {
    getMessages(state) {
      return state.messages;
    },
  },
  // 注册插件，实现状态持久化
  plugins: [persistState],
});
