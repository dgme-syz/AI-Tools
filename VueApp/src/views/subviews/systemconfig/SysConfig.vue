<template>
  <el-container class="page">
      <el-dialog
        v-model="dialogVisible"
        title="裁剪图片"
        class="cropper-dialog"
        append-to-body
        :width="isMobile ? '80%' : '50%'"
      >
          <vue-cropper
            ref="cropperRef"
            :img="imageUrl"
            :outputSize="1"              
            :outputType="'png'"          
            :fixed="true"                
            :fixedNumber="[1, 1]"      
            :full="true"
            :canMove="true"
            :autoCrop="true"
            :background="false"
            style="width: 100%;height: 300px;"
          />
            <el-button type="success" @click="submit" style="width: 100%;margin-top: 2%;">
              设置
            </el-button>
      </el-dialog>
    <el-main class="main1">
      <el-card class="custom-card">
          <div style="justify-content: space-between;display: flex;align-items: center;">
              <span>🌸小助手头像</span>
              <el-upload
                ref="uploadRef"
                class="upload-demo"
                style="width: auto;display: flex;"
                accept="image/*"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleUpload"
              >
                <template #trigger>
                  <el-button type="primary">选择</el-button>
                </template>

              </el-upload>
          </div>
      </el-card>
      <el-card class="custom-card">
          <div style="justify-content: space-between;display: flex;align-items: center;">
              <span>light/dark 切换</span>
              <el-switch
                v-model="theme"
                active-text="dark"
                inactive-text="light"
                active-value="dark"
                inactive-value="light"
                size="large"
              />
          </div>
      </el-card>
      <el-card class="custom-card">
          <div style="justify-content: space-between;display: flex;align-items: center;">
              <span>清空本地缓存</span>
              <el-button type="danger" @click="clearCache">清空</el-button>
          </div>
      </el-card>
    </el-main>
    <el-main class="main2">
      开发中 ...
    </el-main>

  </el-container>
</template>

<script setup lang="ts">
import { ref, watch, watchEffect, computed } from "vue";
import { VueCropper } from "vue-cropper";
import 'vue-cropper/dist/index.css'
import { ElMessage } from "element-plus";
import { useStore } from "vuex";

const store = useStore();
const croppedImage = computed({
  get: () => store.state.url,
  set: (value) => {
    store.commit("updateUrl", value);
  },
})

// 定义响应式变量
const imageUrl = ref<string | null>(null); // 原始图片 URL
const cropperRef = ref(null);
const dialogVisible = ref(false);
const isMobile = window.innerWidth < 768;
const theme = ref("light");

const clearCache = () => {
  localStorage.clear();
  ElMessage({
    message: '已删除',
    grouping: true,
    type: 'success',
  });
  // 刷新页面
  location.reload();
};

watch(imageUrl, (newVal) => {
  // 如果 imageUrl 不为空，则显示对话框
  dialogVisible.value = Boolean(newVal);
});
// 监听 theme 变化，更新 <html> 标签的 data-theme 属性
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value);
});
const submit = () => {
  // getCropBlob 方法会返回裁剪区域的 Blob 数据
  cropperRef.value.getCropBlob((blob) => {
    const file = new File([blob], 'cropped-image.png', { type: blob.type })
    const blobUrl = URL.createObjectURL(file)
    croppedImage.value = blobUrl;
    console.log(blobUrl);
  })
}
// 处理上传的图片
const handleUpload = (file: Object) => {
  console.log(file);
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = URL.createObjectURL(file.raw);
  console.log(imageUrl.value);
};

</script>

<style scoped>  

.page {
    width: 100%;
    display: flex;
    overflow: auto;
}

.main1 {
  width: 45%;
}

.main2 {
  width: 45%;
}


.custom-card {
    backdrop-filter: blur(10px);
    background: rgba(var(--bg-color-rgb), 0.4);
    margin-top: 3%;
}

@media (max-width: 768px) {
  .custom-card {
    backdrop-filter: blur(10px);
    background: rgba(var(--bg-color-rgb), 0.4);
    margin-top: 3%;
  }

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
}


</style>