<template>
  <div>
    <h1>API Data</h1>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <pre v-if="apiResponse">{{ apiResponse }}</pre>
    <el-button @click="fetchData">Fetch Data</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// 定义响应数据和错误信息
const apiResponse = ref(null);
const errorMessage = ref('');

const fetchData = async () => {
  try {
    const rep = await axios.get('http://0.0.0.0:5000/api');
    errorMessage.value = "send request to http://0.0.0.0:5000/api";
    apiResponse.value = JSON.stringify(rep.data, null, 2);
  } catch (error) {
    errorMessage.value += error.message;
  }
};

</script>

<style scoped>
.error {
  color: red;
}
</style>
