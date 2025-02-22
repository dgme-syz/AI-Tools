// src/utils.ts

import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// 字典存储映射
const placeholderDict: { [key: string]: string } = {};

export function replace_token(text: string): string {
    // 替换特殊字符
    text = text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    return text;
}
// 预处理文本，替换代码块和数学公式
export function preprocessText(text: string): string {
    // 转义特殊字符
        
    const inlineCodePatternPlus = /````[\s\S]*?````/g;
    const codeBlockPattern = /```[\s\S]*?```/g; // 匹配代码块
    const inlineCodekPatternP = /``[\s\S]*?``/g; // 匹配代码块
    const inlineCodePattern = /`[^`]*`/g; // 匹配行内代码
    // '''' case
    const mathPatternBlock = /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]/g; // 匹配块级数学公式
    const mathPatternInline = /\$[^$]*\$|\\\([^\)]*\\\)/g; // 匹配行内数学公式

    let counter = 0; // 占位符计数器

    // 替换代码块和行内代码
    text = text.replace(inlineCodePatternPlus, match => {
        const placeholder = `CODEINLINE《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });
    text = text.replace(codeBlockPattern, match => {
        const placeholder = `CODEBLOCK《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });
    text = text.replace(inlineCodekPatternP, match => {
        const placeholder = `CODEBLOCK《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });
    text = text.replace(inlineCodePattern, match => {
        const placeholder = `CODEINLINE《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });

    // 替换数学公式
    text = text.replace(mathPatternBlock, match => {
        const placeholder = `MATHBLOCK《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });
    text = text.replace(mathPatternInline, match => {
        const placeholder = `MATHINLINE《${counter++}》`;
        placeholderDict[placeholder] = replace_token(match);
        return `【${placeholder}】`;
    });

    return text;
}

export function coderesume(text: string, p): string {
    // 类似的，恢复代码
    text = text.replace(/【(.*?)】/g, (match, p1) => {
        // 根据占位符字典还原
        if (placeholderDict[p1]) {
            const originalText = placeholderDict[p1];
            
            if (originalText.slice(0, p) === '`'.repeat(p) && originalText.slice(0, p + 1) !== '`'.repeat(p + 1)) {
                if (p1.startsWith('CODEBLOCK')) {
                    // check lang is specified, if not, default to plaintext
                    const lang = originalText.match(/```(\w+)/);
                    if (lang) {
                        return `<pre><code class="language-${lang[1]}">${originalText.slice(lang[0].length, -3)}</code></pre>`;
                    } else {
                        return `<pre><code>${originalText.slice(3, -3)}</code></pre>`;
                    }
                } else {
                    return `<code>${originalText.slice(p, -p)}</code>`;
                }
            } else {
                return `【${p1}】`;
            }
        }
        return match; 
    });
    return text;
}

// 还原被替换的内容，恢复公式和代码块
export function restoreText(text: string | any): string {
    text = text.replace(/【(.*?)】/g, (match, p1) => {
        // 根据占位符字典还原
        if (placeholderDict[p1]) {
            const originalText = placeholderDict[p1];
            if (p1.startsWith('MATH')) {
                
                // 去除 $$ 和 $ 符号，\[ \] 以及 \( \)
                return p1.startsWith('MATHBLOCK') 
                    ? katex.renderToString(originalText.slice(2, -2), { displayMode: true }) 
                    : originalText[0] === '$'
                        ? katex.renderToString(originalText.slice(1, -1), { displayMode: false })
                        : katex.renderToString(originalText.slice(2, -2), { displayMode: false });
            } else {
                // not replace, namely 【xxx】
                return `【${p1}】`;
            }
            
        }
        return match; 
    });
    
    // 类似的，恢复代码
    text = coderesume(text, 1);
    text = coderesume(text, 2);
    text = coderesume(text, 3);
    text = coderesume(text, 4);
    
    return text;
}

// 解析 Markdown 内容并处理公式
export function parseMarkdown(text: string): string {
    const preprocessedText = preprocessText(text);
    const markdownHtml = marked(preprocessedText); // 使用marked解析
    return restoreText(markdownHtml); // 还原并渲染Katex公式
}
