import { ref, watchEffect } from 'vue';

// 定义 ref 变量
export const model = ref<string>(localStorage.getItem('model') || '');
export const max_tokens = ref<number>(parseInt(localStorage.getItem('max_tokens') || '8192'));
export const temp_ = ref<number>(parseFloat(localStorage.getItem('temp_') || '1'));
export const top_p = ref<number>(parseFloat(localStorage.getItem('top_p') || '1'));
export const api_key = ref<string>(localStorage.getItem('api_key') || '');
export const base_url = ref<string>(localStorage.getItem('base_url') || '');

// 使用 watchEffect 来监控变量的变化，并保存到 localStorage
watchEffect(() => {
  localStorage.setItem('model', model.value);
  localStorage.setItem('max_tokens', max_tokens.value.toString());
  localStorage.setItem('temp_', temp_.value.toString());
  localStorage.setItem('top_p', top_p.value.toString());
  localStorage.setItem('api_key', api_key.value);
  localStorage.setItem('base_url', base_url.value);
});

