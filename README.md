# LLM API Diverter

一个轻量级的 LLM API 分流器，旨在帮助用户管理和优化对多个大语言模型服务（上游）的调用。该分流器兼容 OpenAI API 格式，通过智能路由和权重分配，实现请求在不同模型提供商之间的灵活分发，并支持模型名称的重映射。

## 🚀 功能特性

*   **多上游支持**: 配置多个 LLM API 上游服务，支持不同的 API Key 和根地址。
*   **智能分流**: 根据请求中的模型名称，将请求分发到配置的上游服务。
*   **权重分配**: 为每个上游服务或特定模型设置 `rate`（倍率），实现按比例的请求分发，优化成本或提高可用性。
*   **模型名称重映射**: 允许将请求中使用的模型名称灵活地映射到上游服务实际支持的模型名称，提高兼容性。
*   **OpenAI API 兼容**: 提供与 OpenAI `/v1/chat/completions` 接口兼容的入口，方便现有应用无缝迁移。
*   **YAML 配置**: 所有配置项通过易于阅读和管理的 `config.yml` 文件进行定义。
*   **认证支持 (可选)**: 具备 API Key 认证机制，增强安全性。

## 🛠️ 技术栈

*   **Node.js**: 运行时环境
*   **Express**: 快速、开放、极简的 Web 框架
*   **TypeScript**: 提供类型安全，提高代码质量和可维护性
*   **`js-yaml`**: YAML 解析库
*   **`esbuild`**: 用于快速打包和构建

## ⚙️ 安装与运行 (Docker)

<details>

<summary>使用 Docker 安装</summary>

### Docker Compose 文档
```yaml
services:
  llm-diverter:
    container_name: llm-diverter
    image: ghcr.io/klrohias/llmdiverter:latest
    volumes:
      - <配置文件路径>/config.yml:/config.yml
    networks:
      - services-network
    ports:
      - ...
```

### 配置
参见 [♿ 配置](#-配置)

</details>

## ⚙️ 安装与运行 (手动构建)

<details>

<summary>手动下载构建</summary>

### 前提条件

*   Node.js (版本 18 或更高推荐)
*   PNPM

### 安装

1.  克隆本项目到本地：
    ```bash
    git clone https://github.com/Klrohias/LLMDiverter.git
    cd LLMDiverter
    ```
2.  安装依赖：
    ```bash
    pnpm install
    ```

### 配置
参见 [♿ 配置](#-配置)

### 构建

在项目根目录运行：

```bash
pnpm build
```

检查 `dist` 目录内生成的 `bundle.js` 文件。

### 运行

在项目根目录运行：

```bash
node dist/bundle
```

服务默认会在 `config.yml` 中配置的 `listenPort` (默认为 `8081`) 启动。

</details>


## ♿ 配置

编辑根目录下的 `config.yml` 文件以配置你的上游 LLM API 服务。一个示例配置如下：

```yaml
listenPort: 16388 # 服务监听的端口
# acceptedKeys: # 可选：如果启用认证，此处列出所有接受的 API Keys
#   - your_api_key_1
#   - your_api_key_2
# adminToken: your_admin_token # 可选：管理接口的认证 Token
upstreams:
  - name: xxx # 上游服务的名称
    apiRoot: https://example.com/v1 # 上游服务的 API 根地址
    apiKey: Your Key # 上游服务的 API Key
    models:
      - { name: gpt-4o-mini, rate: 0.4 } # 模型名称和相对倍率
      - { name: deepseek-v3, rate: 5 }
      - { name: deepseek-r1, rate: 10 }
      - { name: qwen3-8b, rate: 1.25 }
  - name: openrouter # 另一个上游服务
    apiRoot: https://openrouter.ai/api/v1
    apiKey: Your Key
    models:
      - { name: deepseek-r1, rename: deepseek/deepseek-r1-0528:free, rate: 1 } # 模型名称重映射示例
      - { name: deepseek-v3, rename: deepseek/deepseek-chat-v3:free, rate: 1 }
```

**配置说明**:

*   `listenPort`: 本地服务监听的端口。
*   `acceptedKeys` (可选): 一个字符串数组，如果提供，则所有传入请求必须在 `Authorization` 头中包含这些 Key 之一。
*   `adminToken` (可选): 用于访问管理接口的 Token。
*   `upstreams`: 上游 LLM API 服务的列表。
    *   `name`: 上游服务的唯一标识名称。
    *   `apiRoot`: 上游 API 的根地址。
    *   `apiKey`: 上游 API 的认证 Key。
    *   `models`: 该上游服务支持的模型列表。
        *   `name`: 本地请求中使用的模型名称。
        *   `rate` (可选): 该模型在此上游的倍率。**值越大，代表在这个上流调用该模型的开销更大，被选中的概率越低**。如果未指定，则默认为 1。
        *   `rename` (可选): 如果上游服务对该模型的名称有特殊要求，可以在此指定其真实名称。


## 💡 使用示例

启动服务后，您可以将原先指向 LLM API 提供商的请求地址改为指向此分流器的地址。

例如，如果您原先向 `https://api.openai.com/v1/chat/completions` 发送请求，现在可以发送到 `http://localhost:16388/v1/chat/completions` (假设您的 `listenPort` 是 16388)。

分流器会根据您请求中的 `model` 字段，结合 `config.yml` 中的配置，选择合适的上游服务进行转发。

```javascript
// 假设使用 fetch API
fetch('http://localhost:16388/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // 如果 config.yml 中配置了 acceptedKeys，则需要提供一个
    // 'Authorization': 'Bearer your_api_key_1',

    // 可以使用 X-Upstream 强制指定从某个上流调用
    // 'X-Upstream': 'XX'
  },
  body: JSON.stringify({
    model: 'deepseek-v3', // 这个模型名称会在配置中查找对应的上游
    messages: [
      { role: 'user', content: 'Hello, what is your name?' }
    ]
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

```

## 贡献

欢迎通过 Pull Request 或 Issues 提出建议和贡献。
