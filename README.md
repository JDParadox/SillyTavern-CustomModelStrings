# Custom Model Strings

A tiny SillyTavern extension that adds a text box under every API model dropdown, so you can type in any model ID — even one that isn't in the list (new releases, preview/beta models, fine-tunes, provider-specific aliases, Ollama tags, etc.).

## Install

In SillyTavern: **Extensions** → **Install extension** → paste:

```
https://github.com/JDParadox/SillyTavern-CustomModelStrings
```

## Use

1. Open **API Connections** and pick your API/source as usual.
2. Under the model dropdown you'll see a **Custom model string…** box.
3. Type the model ID and press **Enter** (or click ✓).

The ID is added to the dropdown as `your-model-id (custom)` and selected. It stays selected after reloads and after SillyTavern refreshes the model list. Click ✕, or just pick a normal model from the dropdown, to stop using it.

## Supported selectors

**Chat Completion:** OpenAI, Claude, OpenRouter, AI21, Google AI Studio, Vertex AI, Mistral, Cohere, Perplexity, Groq, Chutes, Electron Hub, NanoGPT, DeepSeek, AI/ML API, xAI, Pollinations, Moonshot, Fireworks, CometAPI, SiliconFlow, MiniMax, Workers AI, Z.AI, Azure OpenAI.

**Text Completion:** TogetherAI, InfermaticAI, DreamGen, Mancer, OpenRouter, Featherless, Ollama, vLLM, Aphrodite, TabbyAPI, llama.cpp, generic OpenAI-compatible.

The extension only changes which model name SillyTavern sends. If the provider doesn't recognize the ID, you'll get the provider's error. Context size for an unknown model falls back to whatever SillyTavern picks for that source, so check your context slider.

## License

MIT
