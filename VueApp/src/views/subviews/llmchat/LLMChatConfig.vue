<script lang="ts" setup>
import { ref } from 'vue';
import { model, max_tokens, temp_, top_p, api_key, base_url } from "./store/config";
import { computed } from 'vue';
import { useStore } from 'vuex'; // 引入 Vuex store


const store = useStore(); // 使用 Vuex store
const system_prompt = computed({
  get: () => store.state.messages[0][0]?.content || "",  // 读取 Vuex 数据
  set: (newValue) => {
    store.commit("updateSystemPrompt", newValue); // 触发 Vuex mutation 更新数据
  },
});

const props = {
  expandTrigger: 'hover' as const,
}
const options = [
    {value: "deepseek-chat", label: "deepseek-v3"}, 
    {value: "deepseek-reasoner", label: "deepseek-r1"},
    {value: "deepseek-ai/DeepSeek-R1", label: "deepseek-r1 stable"}, 
]
const URL_MAPPING = {
    "deepseek-chat": "https://api.deepseek.com",
    "deepseek-reasoner": "https://api.deepseek.com",
    "deepseek-ai/DeepSeek-R1": "https://api.siliconflow.cn/v1/",
}
const value = ref([]);
const handleChange = (value: string[]) => {
    model.value = value[0];
    base_url.value = URL_MAPPING[value[0]];
}
</script>


<template>
    <el-container class="page">
        <el-main class="main1">
          <el-scrollbar style="padding: 5%;overflow-x: hidden;">
            <span style="font-size:larger;">模型配置</span>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>模型名称</span>
                    <el-cascader
                        v-model="value"
                        :options="options"
                        :props="props"
                        @change="handleChange"
                        class="cascader"
                        filterable
                        clearable
                    />
                </div>
            </el-card>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>Max Tokens</span>
                    <el-input v-model="max_tokens" style="width: auto" placeholder="8192" />
                </div>
            </el-card>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>Temp(0~2)</span>
                    <el-input v-model="temp_" style="width: auto" placeholder="1" />
                </div>
            </el-card>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>Top p(&le; 1)</span>
                    <el-input v-model="top_p" style="width: auto" placeholder="1" />
                </div>
            </el-card>
            <el-card class="custom-card">
              <template #header>
                <div class="card-header">
                  <span>系统提示词</span>
                </div>
              </template>
              <el-input
                v-model="system_prompt"
                style="width: 100%"
                autosize
                type="textarea"
                placeholder="Please input"

              />
            </el-card>
          </el-scrollbar>
        </el-main>
        <!-- <el-divider direction="vertical" class="divider"></el-divider> -->
        <el-main class="main2">
            <span style="font-size:larger;">其它配置</span>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>Api Key</span>
                    <el-input v-model="api_key" style="width: 80%" placeholder="Please input" />
                </div>
            </el-card>
            <el-card class="custom-card">
                <div style="justify-content: space-between;display: flex;align-items: center;">
                    <span>Base Url</span>
                    <el-input v-model="base_url" style="width: 80%" placeholder="Please input" />
                </div>
            </el-card>

        </el-main>
    </el-container>
</template>

<style scoped>

.page {
    width: 100%;
    display: flex;
    overflow: auto;
}

.divider {
    height: 100%;
    border-width: 4px;
    border-color: #ccc;
}

.main1 {
    width: 30%;
    text-align: left;
    flex-direction: column;
    display: flex;
    overflow-y: auto;
    padding: 0px;
}


.main2 {
    width: 45%;
    text-align: left;
    flex-direction: column;
    display: flex;
}

.custom-card {
    backdrop-filter: blur(10px);
    background: rgba(var(--bg-color-rgb), 0.4);
    margin-top: 3%;
}

@media (max-width: 768px) {
  .page {
    flex-direction: column;
  }
  .main1, .main2 {
    flex: none; /* 防止在小屏幕上它们各占一行时撑满 */
    width: 100%; /* 宽度设为100% */
    text-align: left;
    overflow-y: hidden;
    overflow-x: hidden;
  }
  .custom-card {
    backdrop-filter: blur(10px);
    background: rgba(var(--bg-color-rgb), 0.4);
    margin-top: 3%;
  }

}

/* .el-cascader-panel {
    --el-cascader-node-background-hover: #f5a623 !important;
} */


</style>