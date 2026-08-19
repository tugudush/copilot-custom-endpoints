# Free Models & Trial Quotas Guide

This document captures the findings regarding free models, free tiers, and activation quotas across the supported custom endpoint providers as of June 2026.

Using these free options can help you test custom-endpoint configurations or handle routine development tasks without consuming paid AI Credits.

---

## 1. Completely Free API Models (No Cost)

Some providers offer permanently or semi-permanently free model endpoints through their developer consoles.

### GLM (Zhipu AI)

- **Model ID:** `glm-4.7-flash` (or regional variants like `GLM-4-Flash` / `GLM-4.7-Flash`)
- **Offer:** Completely **permanently free** on the domestic developer platform ([bigmodel.cn](https://bigmodel.cn/pricing)). Input tokens, output tokens, context caching, and basic web search capabilities are billed at zero cost.
- **Context Window:** 128K–200K tokens.
- **Open-Weights Models:** Large language models like `GLM-4-9B` and `ChatGLM3-6B` are completely free to download, self-host, and are officially licensed with free commercial-use authorization.
- **Setup Guide Note:** Not included in the [GLM setup guide](../models/glm.md) because of aggressive rate-limit throttling on the free tier, which makes it impractical for typical Copilot Chat workloads. The same caveat applies to other permanently free API models in this section.

### DashScope (Alibaba Cloud / Qwen)

- **Model ID:** `qwen2.5-math-1.5b-instruct`
- **Offer:** Listed as **"Free for a limited time"** on Model Studio for math and logic-oriented reasoning tasks.

---

## 2. Generous Free Trial Quotas (Starter Free Allowances)

Many providers offer substantial trial credits or token pools when you first sign up or activate their specific model studio platforms.

### DashScope (Alibaba Cloud / Qwen)

- **Free Quota:** DashScope offers a standard tier of **1 Million input tokens + 1 Million output tokens** per model.
- **Validity:** Valid for **90 days** from the exact date you activate Model Studio. This applies individually to major models, including:
  - `qwen3.7-max`
  - `qwen3.6-plus`
  - `qwen3-coder-plus`
  - `qwq-plus`
- **Multimodal Quota:** Also offers **100 free generated images** for vision models (e.g., `qwen-image-2.0-pro`, `z-image-turbo`) and **50–200 free seconds of video generation** on selected `wan` video models.

### DeepSeek

- **Free Quota:** While not displaying permanently free tiers for its frontier models, DeepSeek provides new developer registrations with a substantial starter balance (typically **10 Million free tokens**).
- **General Rates:** Once the trial is exhausted, base pay-as-you-go rates are remarkably low (e.g., `deepseek-v4-flash` at $0.44 peak / $0.22 off-peak input and $1.32 peak / $0.66 off-peak output per million tokens).

### Moonshot AI (Kimi)

- **Free Quota:** New sign-ups receive a **15 RMB (~$2 USD)** free trial credit. This allows for extensive testing of models like `kimi-k2.6` (which costs $0.16 input / $0.95–$4.00 output per million tokens) before needing to load a payment method.

### MiniMax

- **Free Quota:** Provides standard developer sign-up starter credits. Additionally, a **permanent 50% off** discount applies to all MiniMax-M3 pay-as-you-go usage (Standard and Priority tiers) — making the effective rates $0.30 / 1M input and $1.20 / 1M output (≤ 512K tier) instead of the $0.60 / 1M and $2.40 / 1M list prices.

---

## 3. Limited-Time Free Feature Promotions

### Xiaomi MiMo / GLM Context Caching

- **Cache Writing:** On platforms utilizing context caching (which dramatically reduces prompt-processing costs on repeating codebases), both **Xiaomi MiMo** and **GLM (Z.ai)** offer **cache writes free of charge** as a limited-time or subscription-bundled promotion.

---

## Related Files

- For a complete pay-as-you-go rate comparison and estimated session costs, see the [Pricing Guide](../pricing.md).
- Specific provider instructions can be found under the [Models Roster](../models/).
