import json
from flask import Response

from flask import Flask, jsonify, request
from flask_cors import CORS
from LLMChatzLocal import Chat  # 确保 LLMChatzLocal.py 里有 Chat 类

# 创建 Flask 应用
app = Flask(__name__)
chat = None

# 启用 CORS，允许所有来源访问
CORS(app)

# 定义一个简单的 API 路由
@app.route('/api', methods=['GET'])
def get_data():
    data = {
        "message": "Hello, this is a simple Flask API!",
        "status": "success"
    }
    return jsonify(data)

@app.route('/chat-start', methods=['POST'])
def chat_start():
    data = request.json
    if not data or "model_name" not in data:
        return jsonify({"status": "error", "message": "Missing model_name"}), 400
    
    global chat
    if chat: del chat
    chat = Chat(data["model_name"])
    return jsonify({"status": "success"})

@app.route('/chat/completions', methods=['POST'])
def chat_generate():
    data = request.json
    print(data)
    if not data or "messages" not in data:
        return jsonify({"status": "error", "message": "Missing inputs"}), 400
    
    if not chat:
        return jsonify({"status": "error", "message": "Chat not started"}), 400
    
    def generate_stream():
        """ 流式返回新 tokens """
        for new_text in chat.generate(
            inputs=data["messages"],  #
            max_tokens=data.get("max_tokens", 4096),
            temp=data.get("temp", 1),
            top_p=data.get("top_p", 1),
        ):
            response_data = {
                "object": "chat.completion.chunk",
                "choices": [
                    {
                        "index": 0,
                        "delta": {
                            "content": new_text,
                            "role": "assistant"
                        },
                        "finish_reason": None,
                    }
                ],
                "usage": None
            }
            yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
        done_data = {
            "object": "chat.completion.chunk",
            "choices": [
                {
                    "index": 0,
                    "delta": {
                        "content": "",
                        "role": None
                    },
                    "finish_reason": "stop",
                }
            ],
        }
        yield f"data: {json.dumps(done_data, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return Response(generate_stream(), content_type="text/event-stream; charset=utf-8")


# 启动 Flask 服务
def main():
    app.run(debug=False, threaded=False, use_reloader=False)

if __name__ == "__main__":
    main()
