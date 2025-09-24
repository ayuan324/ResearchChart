
DISENTANGLED SIGNALS, DYNAMIC PROMPTS: A META-NETWORK FRAMEWORK FOR ROBUST TASK-ORIENTED DIALOGUE

# Author(s) Name(s)

# Author Affiliation(s)

# ABSTRACT

Task-oriented dialogue (ToD) systems facilitate goal-oriented interactions by understanding user intents, accessing external APIs, and generating appropriate responses. Recent large language model (LLM)-based approaches have improved end-to-end dialogue capabilities, but they still face two major limitations: static prompts lack adaptability in dynamic multi-turn conversations, and full-model fine-tuning is computationally expensive and prone to overfitting. We propose D²-AutoTOD, a parameter-efficient framework that integrates a disentangled context encoder with a Feature-wise Linear Modulation (FiLM) based dynamic prompting mechanism. The model explicitly encodes four complementary signals, namely the user utterance, dialogue history, previous system action, and execution feedback, and generates turn-specific modulation vectors through a lightweight Dialogue Meta-Network to dynamically condition a frozen LLM. Experiments on MultiWOZ 2.2 and SGD demonstrate that D²-AutoTOD significantly improves task success, dialogue quality, and robustness under noisy conditions while achieving strong cross-domain generalization. These results highlight the potential of dynamic and feedback-aware prompting for building scalable and adaptive task-oriented dialogue systems.

Index Terms— Task-oriented dialogue systems, large language models, dynamic prompt learning, meta-network.

# 1. INTRODUCTION

Task-oriented dialogue (ToD) systems aim to understand user goals, interact with external databases or APIs, and generate accurate and coherent responses that help users accomplish tasks. With the rapid development of large language models (LLMs), the community has shifted from modular pipelines that separate dialogue state tracking, policy learning, and response generation to end-to-end LLM-driven frameworks. This transition enhances reasoning and language understanding but leaves two major challenges. First, many LLM-based ToD systems still rely on static prompts that are either handcrafted or learned once during training. Static prompts struggle to adapt as conversations evolve when previous system actions and execution feedback should directly influence decisions. Second, full fine-tuning of LLM provides adaptability but is computationally expensive and prone to overfitting, which limits practicality in scenarios with limited domain-specific data or frequent domain changes.

To mitigate these issues, recent work has injected structure or inductive bias. Hierarchical goal modeling decomposes complex tasks into manageable units that guide planning. Dialogue structure modeling captures multi-turn flow and long-range dependencies for coherent interaction. Graph-based schema representations have been used to synthesize dialogues for data augmentation. Our extensive experiments on MultiWOZ and SGD show that our method matches or even exceeds the performance of GPT-4-based AutoTOD, while utilizing a frozen open-source backbone and a lightweight, trainable prompt layer. Notably, our approach achieves strong results even under leave-one-domain and unseen-service scenarios, demonstrating superior robustness and cross-domain adaptability. Our contributions are threefold:

- We propose a novel and parameter-efficient framework, D²-AutoTOD, which explicitly disentangles dialogue signals.

Thanks to XYZ agency for funding.


# 2. METHODOLOGY

This section presents the proposed D²-AutoTOD, a framework designed to overcome a critical limitation of existing zero-shot ToD: high sensitivity to prompt engineering. Our approach enables dynamic, context-aware dialogue generation by integrating a disentangled context representation with a parameter-efficient modulation mechanism that adapts a frozen LLM. Crucially, with a minimal amount of training, our method achieves performance comparable to state-of-the-art approaches that combine meticulously designed prompts with powerful LLM (e.g. GPT-4). The training process endows the model with strong generalization, allowing it to automatically switch between diverse dialogue strategies as the conversation evolves. Furthermore, as demonstrated in Section 3, D²-AutoTOD exhibits superior robustness, maintaining high performance when encountering real-world challenges such as API errors and noisy user inputs. The overall architecture is depicted in Figure 1.

# 2.1. Model Architecture

The architecture of D²-AutoTOD is composed of three primary, synergistic modules: a disentangled context encoder, a dialogue meta-network for dynamic prompt, and a frozen LLM executor.

# 2.1.1. Disentangled Context Encoder

To effectively capture the multi-faceted nature of the dialogue state, we eschew a monolithic context representation. Our encoder processes four distinct channels of information, preserving their unique semantic contributions:

- Current User Utterance (Uₜ): The most recent input from the user, representing their immediate intent;
- Cumulative Dialogue History (Ht−1): The full conversation history up to the previous turn, providing broader context;
- Previous Action (At−1): The specific action (e.g., API CALL or RESPONSE) taken by the system in the preceding turn, providing a clear signal of the system’s last state;
- Action Execution Feedback (Rt−1): The result of the previous action (e.g., SUCCESS, ERROR API). This signal is critical for error recovery and robust strategy adaptation.

To ensure semantic alignment with the LLM executor, textual inputs (Uₜ and Ht−1) are encoded using the LLM’s own frozen token embeddings. The categorical inputs (At−1 and Rt−1) are mapped to dense vectors via separate, learnable embedding layers. The resulting four vectors are concatenated to form a comprehensive turn-level context vector cₜ, which serves as the input to the meta-network.

# 2.1.2. Dynamic Dialogue Modulator

This module forms the core of our dynamic adaptation mechanism. It is designed to translate the turn-specific context vector cₜ into an adaptive tactical prompt for the LLM, effectively bridging the gap between static task knowledge and dynamic dialogue flow. The modulator consists of a Dialogue Meta-Network that generates conditioning signals and a Dynamic Prompt Modulation layer that applies these signals to a set of learnable base vectors.

We employ a lightweight, two-layer Multi-Layer Perceptron (MLP) with a bottleneck architecture as the meta-network. This network is engineered for high parameter efficiency, learning a crucial mapping from the immediate dialogue state to an optimal response strategy. For instance, in a MultiWOZ scenario, the meta-network learns to differentiate between a user’s initial query for a restaurant, which requires an information-gathering policy, and a subsequent booking request following a successful API search, which necessitates a transactional policy.

Instead of a static prompt, we introduce a learnable base prompt, Pbase, a sequence of M trainable vectors, Pbase = p1, p2, . . . , pM, representing an abstract policy space. The meta-network processes context vector cₜ and outputs two modulation vectors, scaling γₜ and shifting βₜ. These vectors condition the base prompt via Feature-wise Linear Modulation (FiLM) to generate a turn-specific tactical prompt, Pfinal(t):

Pfinal(t) = γt ⊙ Pbase + βt,

where ⊙ denotes element-wise multiplication. This FiLM layer enables the meta-network to dynamically re-weight and re-purpose components of the base prompt. Consider a situation where a Restaurant-Search API call returns an empty result; the meta-network, conditioned on the ERROR EMPTY RESULT feedback, will generate modulation vectors that transform the base prompt into a tactical instruction. This instruction steers the LLM towards a recovery strategy, such as suggesting alternative search criteria, rather than terminating the dialogue. In essence, the tactical prompt acts as a soft, continuous instruction that guides the LLM’s behavior for the current turn, adapting its focus among API generation, user clarification, and error handling.

# 2.1.3. Frozen LLM Executor

The backbone of our framework is a powerful, pre-trained, open-source LLM. Critically, the parameters of the LLM remain completely frozen throughout the training process. The final input fed to the LLM is a sequence of embeddings constructed from the dynamically generated prompt, the dialogue history, the user utterance, and the API result (if any): Pfinal(t), Ht−1, Ut, Rt−1.



# Table 1: MultiWOZ 2.0 (left) and SGD (right).* Fully supervised end-to-end or parameter-efficient methods; AutoTOD is zero-shot.

| Model           | Domain | Dialogue | Service | Dialogue |
| --------------- | ------ | -------- | ------- | -------- |
| Ours            | Inf.   | Succ.    | Book    | Comb.    |
|                 | 83.8   | 61.5     | 84.3    | 78.6     |
| SimpleTOD\*     | 32.5   | 29.4     | –       | 23.6     |
| UBAR\*          | 40.8   | 33.3     | –       | 28.7     |
| GALAXY\*        | 44.4   | 35.1     | –       | 31.0     |
| MARS\*          | 42.7   | 34.4     | –       | 30.0     |
| TOATOD\*        | 45.3   | 36.7     | –       | 31.8     |
| ZS-ToD\*        | –      | –        | –       | –        |
| AutoTOD (GPT-4) | 85.2   | 59.1     | 86.7    | 79.1     |

then auto-regressively generates the system’s response, be it a natural language utterance to the user or a structured API call. All scores are derived directly by extracting key information from dialogue logs, without relying on intermediate dialogue states. For a comprehensive comparison, we also report traditional task-oriented dialogue metrics, including BLEU, Inform, Success, and Combine.

# 2.2. Training Strategy

Our training objective is to learn a generalizable state-to-strategy mapping function with exceptional parameter efficiency. To achieve this, the vast majority of the model, specifically the core LLM executor and its token embeddings, remains entirely frozen. The set of trainable parameters is minimal, comprising only the weights of the Dialogue Meta-Network (θₘₑₜₐ), the base prompt vectors (Pbase), and the action and feedback embedding layers. This constitutes an extremely small fraction of the total parameters.

This strategy prevents the model from “memorizing” specific dialogue flows and instead compels it to learn a robust, context-aware policy. Consequently, requiring only a sample of cases from diverse scenarios in the datasets. During the backward pass, although the LLM’s weights are immutable, it functions as a differentiable operator. The gradient from the loss propagates back through it, effectively calculating how the input prompt embeddings P (t) should be modified to improve the output probability. This final provides a clear directive for updating the meta-network and base prompt.

For example, a context featuring an ERROR EMPTY RESULT signal will generate a gradient that updates the trainable modules to produce a tactical prompt steering the LLM toward a recovery-oriented, question-asking policy. Through this gradient-based optimization, the meta-network progressively learns to implement robust dialogue policies for a wide range of situations, enabling it to adapt its strategy dynamically throughout a conversation.

# 3. EXPERIMENTS

# 3.1. Experiments Setting

Datasets. Our experimental evaluations utilize the publicly available MultiWOZ and SGD datasets. Specifically, for MultiWOZ, we employ version 2.0, adhering to the official training, validation, and test splits as established in the AutoTOD framework [32]. For the SGD dataset, we follow the original service-based partitioning scheme and report aggregated performance metrics while maintaining the inherent service distribution.

Metric. To ensure comparability, we align our end-to-end evaluation with the user simulator-based framework from AutoTOD. We use Inform, Success, Book, and the composite metric Combine as our primary measures. The Combine score is calculated as 0.5 × Inform + 0.25 × (Success + Book).



SGD dataset, we report Service Level and Dialogue Level Inform and Success metrics. Baselines and the simulation-based end-to-end protocol follow AutoTOD [32]. As shown in Table 1, our method’s performance is comparable to the AutoTOD baseline, despite using a frozen, open-source backbone. Our score on the composite metric ‘Combine’ is nearly on par with the baseline; however, we demonstrate a clear advantage on the ‘Success’ metric, achieving a significant 2.4 increase at the domain level (61.5 vs. 59.1). This targeted improvement in ‘Success’ results from a strategic trade-off: a slight decrease in the ‘Inform’ and ‘Book’ scores suggests that our model has learned a more pragmatic, goal-focused policy. It prioritizes robustly completing the user’s ultimate objective over intermediate information-provision sub-tasks, leading to steadier and more reliable task completion in multi-turn interactions.

# 3.3. Generalization and robustness

Corss-domain. For MultiWOZ, we adopt a leave-one-domain protocol: all dialogues from one domain are withheld during training, while its schema remains in the prompt. Evaluation is performed on the held-out domain. For SGD, we focus on services absent from the training split and evaluate using the same simulator and tool backends. The backbone model remains frozen; only the static prompt and meta-network for dynamic prompting are updated. The same decoding method and evaluator are used across all folds. This setting tests schema-only generalization, where no in-domain conversations are seen. Our dynamic prompting mechanism significantly improves schema-only generalization. On the challenging MultiWOZ leave-one-domain task, our method outperforms the ‘Static Only’ variant by 6.0 in Success rate and surpasses the powerful AutoTOD baseline. This strong transferability is reflected in SGD unseen services, where our performance closely matches GPT-4 and is substantially better than the static version. These results suggest conditioning the prompt on a disentangled context yields a more robust, transferable policy than a single fixed prompt.

# 3.4. Ablations

We compare four variants under the same protocol: the full model with a two-layer meta-network that instantiates a dynamic prompt added to a static prompt; a static-only variant; a linearized meta-network; and a FiLM variant that applies feature-wise scaling and shifting to prompts or intermediate activations to inject signals for the current user utterance, dialogue history, previous system action, and execution feedback. The ablation studies in Table 4 validate our design choices. Removing dynamic modulation causes a significant decline in goal completion, with success rate dropping by 4.5, underscoring its importance. Although a linearized meta-network recovers some performance, the non-linearity and feature-wise conditioning of our full FiLM-based model yield the best results. This confirms that all components, including dynamic prompting, a non-linear meta-network, and feature-wise conditioning, are essential for learning an effective and adaptive dialogue policy.

| Setting               | Method          | Inform | Success |
| --------------------- | --------------- | ------ | ------- |
| MultiWOZ              | Ours            | 74.8   | 49.1    |
|                       | AutoTOD (GPT-4) | 73.9   | 46.8    |
| SGD (unseen services) | Static Only     | 70.5   | 43.1    |
|                       | Ours            | 45.2   | 20.7    |
|                       | AutoTOD (GPT-4) | 45.9   | 21.0    |
|                       | Static Only     | 41.2   | 16.9    |

| Variant     | Inform ↑ | Success ↑ | Book ↑ | Combine ↑ |
| ----------- | -------- | --------- | ------ | --------- |
| Full Model  | 79.4     | 47.5      | 83.1   | 72.0      |
| Static Only | 76.3     | 43.0      | 78.4   | 68.1      |
| Linearized  | 77.2     | 44.6      | 79.3   | 69.2      |
| FiLM        | 79.8     | 48.2      | 83.6   | 72.5      |

# 4. CONCLUSION

We introduced D²-AutoTOD, a parameter-efficient framework that dynamically adapts frozen LLMs through disentangled context encoding and FiLM-based prompt modulation. Experiments on MultiWOZ and SGD show improved task success, robustness, and cross-domain generalization, highlighting the potential of feedback-aware dynamic prompting for scalable task-oriented dialogue systems. Future work will explore richer feedback modeling and integration with tool discovery for broader real-world deployment.



# 5. REFERENCES

1. OpenAI, “Chatgpt: Large language model,” https://chat.openai.com, 2025, Accessed: 2025-09-15.
2. Gemini Team, “Gemini: A family of highly capable multi-modal models,” 2025.
3. DeepSeek-AI, “Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning,” 2025.
4. Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier Martinet, Marie-Anne Lachaux, Timoth´ Rozi` ee Lacroix, Baptiste Naman Goyal, Eric Hambro, Faisal Azhar, Aurelien Rodriguez, Armand Joulin, Edouard Grave, and Guillaume Lample, “Llama: Open and efficient foundation language models,” 2023.
5. Haotian Liu, Chunyuan Li, Yuheng Li, and Yong Jae Lee, “Improved baselines with visual instruction tuning,” 2024.
6. Li Dong, Nan Yang, Wenhui Wang, Furu Wei, Xiaodong Liu, Yu Wang, Jianfeng Gao, Ming Zhou, and Hsiao-Wuen Hon, “Unified language model pre-training for natural language understanding and generation,” 2019.
7. Jacob Devlin, Ming-Wei Chang, Kenton Lee, and Kristina Toutanova, “Bert: Pre-training of deep bidirectional transformers for language understanding,” 2019.
8. Kaiyang Zhou, Jingkang Yang, Chen Change Loy, and Ziwei Liu, “Learning to prompt for vision-language models,” International Journal of Computer Vision, vol. 130, no. 9, pp. 2337–2348, July 2022.
9. Xiang Lisa Li and Percy Liang, “Prefix-tuning: Optimizing continuous prompts for generation,” 2021.
10. Brian Lester, Rami Al-Rfou, and Noah Constant, “The power of scale for parameter-efficient prompt tuning,” 2021.
11. Xiao Liu, Kaixuan Ji, Yicheng Fu, Weng Lam Tam, Zhengxiao Du, Zhilin Yang, and Jie Tang, “P-tuning v2: Prompt tuning can be comparable to fine-tuning universally across scales and tasks,” 2022.
12. Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, and Weizhu Chen, “Lora: Low-rank adaptation of large language models,” 2021.
13. Neil Houlsby, Andrei Giurgiu, Stanislaw Jastrzebski, Bruna Morrone, Quentin de Laroussilhe, Andrea Gesmundo, Mona Attariyan, and Sylvain Gelly, “Parameter-efficient transfer learning for nlp,” 2019.
14. Lingbo Mo, Shun Jiang, Akash Maharaj, Bernard Hishamunda, and Yunyao Li, “Hiertod: A task-oriented dialogue system driven by hierarchical goals,” 2025.
15. Ali Baheri and Cecilia O. Alm, “Hierarchical neuro-symbolic decision transformer,” 2025.
16. Sungryull Sohn, Yiwei Lyu, Anthony Liu, Lajanugen Logeswaran, Dong-Ki Kim, Dongsub Shim, and Honglak Lee, “Tod-flow: Modeling the structure of task-oriented dialogues,” 2023.
17. Baolin Peng, Michel Galley, Pengcheng He, Chris Brockett, Lars Liden, Elnaz Nouri, Zhou Yu, Bill Dolan, and Jianfeng Gao, “Godel: Large-scale pre-training for goal-directed dialog,” 2022.


