from dataclasses import dataclass
import os
from threading import Thread

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

# 设置 Hugging Face 镜像
os.environ["HF_HOME"] = os.path.join(os.environ["HOME"], "saves")
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

@dataclass
class Chat:
    """ LLM Chat Class with Streaming Output """
    
    def __init__(self, model_name: str):
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name, torch_dtype="auto"
        )
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

    def generate(
        self, 
        inputs: list, 
        max_tokens: int = 4096,
        temp: float = 1,
        top_p: float = 1,
    ):
        """ Stream new tokens from the model """
        
        # 构造输入
        prompt = self.tokenizer.apply_chat_template(
            inputs, tokenize=False, add_generation_prompt=True
        )
        input_ids = self.tokenizer(prompt, return_tensors="pt")

        # 使用 TextIteratorStreamer 进行流式解码
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)

        # 运行生成线程
        thread = Thread(target=self.model.generate, kwargs={
            **input_ids,
            "streamer": streamer,
            "do_sample": True,
            "max_new_tokens": max_tokens,
            "temperature": temp,
            "top_p": top_p,
        })
        thread.start()

        # 持续返回新 tokens
        for new_text in streamer:
            yield new_text

# 测试代码
# if __name__ == '__main__':
#     chat = Chat("Qwen/Qwen2.5-1.5B-Instruct")
#     for text in chat.generate(
#         inputs=[
#             {"role": "system", "content": "你是猫娘"},
#             {"role": "user", "content": "你好啊"},
#         ]
#     ):
#         print(text, end="", flush=True)  # 逐步打印新 tokens
