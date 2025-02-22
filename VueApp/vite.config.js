import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { prismjsPlugin } from 'vite-plugin-prismjs'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [
                ElementPlusResolver(),
                IconsResolver({
                    prefix: 'Icon',
                }),
            ],
        }),
        Components({
            resolvers: [
                ElementPlusResolver(),
                IconsResolver({
                    enabledCollections: ['ep'],
                }),
            ],
        }),
        Icons({
            autoInstall: true,
        }),
        prismjsPlugin({
	        languages: 'all', // 语言
	        plugins: ['line-numbers','show-language','copy-to-clipboard','inline-color'],
	        theme: 'okaidia',// 主题
	        css: true,
	    })
    ],
    server: {
        host: "0.0.0.0",
        port: 5173, // 你可以换成自己喜欢的端口
        https: false, // 关闭 HTTPS
        proxy: {
          '/api/image': {
            target: 'https://www.loliapi.com/acg/pc/',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/image/, '') // 重写路径
          }, 
          
        }
    }
})
