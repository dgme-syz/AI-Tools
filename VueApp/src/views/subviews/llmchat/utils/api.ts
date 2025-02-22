// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";
import { ElMessage } from "element-plus";

export async function GetResponse(
  mes: Array<{ role: string; content: string }>,
  model: string,
  max_tokens: number,
  temperature: number,
  top_p: number,
  api_key: string,
  base_url: string
): Promise<ReadableStream | null> {
  try {
    const openai = new OpenAI({
      baseURL: base_url,  // 确保你的模型对应的 URL 是有效的
      apiKey: api_key,
      dangerouslyAllowBrowser: true,
    });

    console.log(mes);
    console.log(model);
    console.log(max_tokens);
    console.log(temperature);
    console.log(top_p);
    console.log(base_url);

    // 发起请求获取回应，启用流式输出
    const completion = await openai.chat.completions.create({
      messages: mes,
      model: model,
      max_tokens: max_tokens,
      temperature: temperature,
      top_p: top_p,
      stream: true,  // 开启流模式
    });

    console.log(completion, "&&&&&&&&&&&&&&&")
    // 返回流对象
    return completion;
  } catch (error) {
    console.error('Error getting response:', error);
    return null;  // 如果发生错误，返回 null
  }
}


// check status and output of the response
export function check_params(
  model: string,
  max_tokens: number,
  temperature: number,
  top_p: number,
  api_key: string,
): [boolean, string] {

  if (max_tokens <= 1) {
    ElMessage.error("max_tokens 应该 > 1");
    return [false, "max_tokens should be greater than 1"];
  }
  
  if (temperature <= 0 || temperature > 2) {
    ElMessage.error("temp 应该位于 (0, 2] 范围之内");
    return [false, "temperature should be in the range (0, 2]"];
  }

  if (top_p <= 0 || top_p > 1) {
    ElMessage.error("top p 应该位于 (0, 1] 范围之内");
    return [false, "top_p should be in the range (0, 1]"];
  }

  if (api_key === "") {
    ElMessage.error("api key 不应该为空");
    return [false, "api key 不应该为空"];
  }

  return [true, ""];
}
