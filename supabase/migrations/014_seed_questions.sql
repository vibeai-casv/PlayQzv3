-- Seed questions from qbank JSON files


INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'In Machine Learning, what is the term for data that the model has never seen before, used to evaluate its performance?',
    'text_mcq',
    '["Training Data","Test Data","Feature Data","Raw Data"]'::jsonb,
    'Test Data',
    'easy',
    'Fundamentals',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'In Machine Learning, what is the term for data that the model has never seen before, used to evaluate its performance?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which of the following is NOT a type of Machine Learning?',
    'text_mcq',
    '["Supervised Learning","Unsupervised Learning","Reinforcement Learning","Deductive Learning"]'::jsonb,
    'Deductive Learning',
    'medium',
    'Fundamentals',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which of the following is NOT a type of Machine Learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does the ''P'' stand for in ''GPT''?',
    'text_mcq',
    '["Processing","Pre-trained","Predictive","Programmed"]'::jsonb,
    'Pre-trained',
    'hard',
    'LLMs',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does the ''P'' stand for in ''GPT''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which architecture is the foundation for most modern Large Language Models?',
    'text_mcq',
    '["Convolutional Neural Networks","Recurrent Neural Networks","Transformer","Decision Trees"]'::jsonb,
    'Transformer',
    'medium',
    'LLMs',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which architecture is the foundation for most modern Large Language Models?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What technique do LLMs use to predict the next word in a sequence?',
    'text_mcq',
    '["Next Token Prediction","Word Sequencing","Text Completion","Language Guessing"]'::jsonb,
    'Next Token Prediction',
    'medium',
    'LLMs',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What technique do LLMs use to predict the next word in a sequence?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which type of neural network is most commonly used for image recognition?',
    'text_mcq',
    '["CNN (Convolutional Neural Network)","RNN (Recurrent Neural Network)","LSTM (Long Short-Term Memory)","GAN (Generative Adversarial Network)"]'::jsonb,
    'CNN (Convolutional Neural Network)',
    'easy',
    'Computer Vision',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which type of neural network is most commonly used for image recognition?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does YOLO stand for in computer vision?',
    'text_mcq',
    '["You Only Look Once","Your Object Location Optimizer","Young Optimized Learning Object","Yield Oriented Local Operation"]'::jsonb,
    'You Only Look Once',
    'medium',
    'Computer Vision',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does YOLO stand for in computer vision?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the term for AI systems making biased decisions based on training data?',
    'text_mcq',
    '["Algorithmic Bias","Machine Prejudice","Data Discrimination","AI Racism"]'::jsonb,
    'Algorithmic Bias',
    'medium',
    'Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the term for AI systems making biased decisions based on training data?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which AI technology is used by Netflix and Amazon for product recommendations?',
    'text_mcq',
    '["Recommendation Systems","Predictive Analytics","Customer Profiling","Sales Optimization"]'::jsonb,
    'Recommendation Systems',
    'easy',
    'Applications',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which AI technology is used by Netflix and Amazon for product recommendations?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What type of AI is used in self-driving cars?',
    'text_mcq',
    '["Reinforcement Learning","Computer Vision","Natural Language Processing","All of the above"]'::jsonb,
    'All of the above',
    'medium',
    'Applications',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What type of AI is used in self-driving cars?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the name of the problem where gradients become too small during backpropagation?',
    'text_mcq',
    '["Vanishing Gradient Problem","Exploding Gradient Problem","Gradient Descent Issue","Backpropagation Failure"]'::jsonb,
    'Vanishing Gradient Problem',
    'hard',
    'Deep Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the name of the problem where gradients become too small during backpropagation?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which activation function is commonly used in output layers for binary classification?',
    'text_mcq',
    '["Sigmoid","ReLU","Tanh","Leaky ReLU"]'::jsonb,
    'Sigmoid',
    'medium',
    'Deep Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which activation function is commonly used in output layers for binary classification?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does NLP stand for in AI?',
    'text_mcq',
    '["Natural Language Processing","Neural Language Programming","Network Learning Process","Native Linguistic Protocol"]'::jsonb,
    'Natural Language Processing',
    'easy',
    'Natural Language Processing',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does NLP stand for in AI?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which technique converts words into numerical vectors?',
    'text_mcq',
    '["Word Embeddings","Text Vectorization","Language Encoding","Word Digitization"]'::jsonb,
    'Word Embeddings',
    'medium',
    'Natural Language Processing',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which technique converts words into numerical vectors?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which Python library is most popular for Machine Learning?',
    'text_mcq',
    '["Scikit-learn","TensorFlow","PyTorch","All of the above"]'::jsonb,
    'All of the above',
    'easy',
    'Tools & Frameworks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which Python library is most popular for Machine Learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is Jupyter Notebook primarily used for?',
    'text_mcq',
    '["Data analysis and visualization","Web development","Mobile app development","Game development"]'::jsonb,
    'Data analysis and visualization',
    'medium',
    'Tools & Frameworks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is Jupyter Notebook primarily used for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'In what year was the term ''Artificial Intelligence'' first coined?',
    'text_mcq',
    '["1956","1965","1972","1980"]'::jsonb,
    '1956',
    'medium',
    'AI History',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'In what year was the term ''Artificial Intelligence'' first coined?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which famous test, proposed in 1950, determines if a machine can exhibit intelligent behavior indistinguishable from a human?',
    'text_mcq',
    '["The Voigt-Kampff Test","The Turing Test","The Lovelace Test","The Imitation Game"]'::jsonb,
    'The Turing Test',
    'hard',
    'AI History',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which famous test, proposed in 1950, determines if a machine can exhibit intelligent behavior indistinguishable from a human?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does DALL-E generate?',
    'text_mcq',
    '["Images from text descriptions","Text from images","Music from text","Video from audio"]'::jsonb,
    'Images from text descriptions',
    'easy',
    'Generative AI',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does DALL-E generate?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What are the two networks in a GAN (Generative Adversarial Network)?',
    'text_mcq',
    '["Generator and Discriminator","Encoder and Decoder","Producer and Consumer","Creator and Evaluator"]'::jsonb,
    'Generator and Discriminator',
    'medium',
    'Generative AI',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What are the two networks in a GAN (Generative Adversarial Network)?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'In reinforcement learning, what is the name of the algorithm that uses a table to store state-action values?',
    'text_mcq',
    '["Q-Learning","Policy Gradients","Deep Q-Network","Actor-Critic"]'::jsonb,
    'Q-Learning',
    'medium',
    'Reinforcement Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'In reinforcement learning, what is the name of the algorithm that uses a table to store state-action values?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which company''s AI system defeated the world champion in Go?',
    'text_mcq',
    '["DeepMind''s AlphaGo","OpenAI''s Five","Google''s Minerva","Microsoft''s Tay"]'::jsonb,
    'DeepMind''s AlphaGo',
    'hard',
    'Reinforcement Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which company''s AI system defeated the world champion in Go?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the basic building block of a neural network?',
    'text_mcq',
    '["Neuron","Node","Processor","Calculator"]'::jsonb,
    'Neuron',
    'easy',
    'Neural Networks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the basic building block of a neural network?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What process adjusts the weights in a neural network during training?',
    'text_mcq',
    '["Backpropagation","Forward propagation","Weight optimization","Gradient ascent"]'::jsonb,
    'Backpropagation',
    'medium',
    'Neural Networks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What process adjusts the weights in a neural network during training?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the term for cleaning and preparing raw data for analysis?',
    'text_mcq',
    '["Data Wrangling","Data Mining","Data Storage","Data Collection"]'::jsonb,
    'Data Wrangling',
    'easy',
    'Data Science',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the term for cleaning and preparing raw data for analysis?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which metric is used for evaluating classification models?',
    'text_mcq',
    '["Accuracy","Mean Squared Error","R-squared","All of the above"]'::jsonb,
    'Accuracy',
    'medium',
    'Data Science',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which metric is used for evaluating classification models?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does CNN use to detect features in images?',
    'text_mcq',
    '["Filters/Kernels","Layers","Neurons","Algorithms"]'::jsonb,
    'Filters/Kernels',
    'hard',
    'Computer Vision',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does CNN use to detect features in images?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which dataset is famous for image classification with 1000 classes?',
    'text_mcq',
    '["ImageNet","CIFAR-10","MNIST","COCO"]'::jsonb,
    'ImageNet',
    'medium',
    'Computer Vision',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which dataset is famous for image classification with 1000 classes?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the attention mechanism in transformers called?',
    'text_mcq',
    '["Self-Attention","Multi-Head Attention","Scaled Dot-Product Attention","All of the above"]'::jsonb,
    'All of the above',
    'hard',
    'LLMs',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the attention mechanism in transformers called?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''tokenization'' do in NLP?',
    'text_mcq',
    '["Splits text into smaller units","Converts text to numbers","Removes stop words","Identifies parts of speech"]'::jsonb,
    'Splits text into smaller units',
    'medium',
    'LLMs',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''tokenization'' do in NLP?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''Explainable AI'' (XAI)?',
    'text_mcq',
    '["AI that can explain its decisions","AI that teaches itself","AI that explains concepts to humans","AI that writes documentation"]'::jsonb,
    'AI that can explain its decisions',
    'medium',
    'Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''Explainable AI'' (XAI)?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What principle ensures AI systems treat all individuals fairly?',
    'text_mcq',
    '["Fairness","Transparency","Accountability","Privacy"]'::jsonb,
    'Fairness',
    'hard',
    'Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What principle ensures AI systems treat all individuals fairly?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which hardware component is most critical for training large Deep Learning models?',
    'text_mcq',
    '["CPU (Central Processing Unit)","GPU (Graphics Processing Unit)","SSD (Solid State Drive)","RAM (Random Access Memory)"]'::jsonb,
    'GPU (Graphics Processing Unit)',
    'easy',
    'Hardware',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which hardware component is most critical for training large Deep Learning models?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does TPU stand for?',
    'text_mcq',
    '["Tensor Processing Unit","Training Processing Unit","Text Processing Unit","Tensor Performance Unit"]'::jsonb,
    'Tensor Processing Unit',
    'medium',
    'Hardware',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does TPU stand for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which AI application converts speech to text?',
    'text_mcq',
    '["Speech Recognition","Text-to-Speech","Voice Synthesis","Audio Processing"]'::jsonb,
    'Speech Recognition',
    'easy',
    'Applications',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which AI application converts speech to text?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''computer vision'' used for?',
    'text_mcq',
    '["Understanding and analyzing images","Creating computer graphics","Designing user interfaces","Programming computers"]'::jsonb,
    'Understanding and analyzing images',
    'medium',
    'Applications',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''computer vision'' used for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''dropout'' in neural networks?',
    'text_mcq',
    '["A regularization technique","A type of activation function","A weight initialization method","A loss function"]'::jsonb,
    'A regularization technique',
    'hard',
    'Deep Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''dropout'' in neural networks?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which optimizer is commonly used in deep learning?',
    'text_mcq',
    '["Adam","SGD","RMSprop","All of the above"]'::jsonb,
    'All of the above',
    'medium',
    'Deep Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which optimizer is commonly used in deep learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''BERT'' in NLP?',
    'text_mcq',
    '["Bidirectional Encoder Representations from Transformers","Basic English Response Transformer","Binary Encoding and Recognition Technology","Best Entity Recognition Tool"]'::jsonb,
    'Bidirectional Encoder Representations from Transformers',
    'hard',
    'Natural Language Processing',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''BERT'' in NLP?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does NER stand for in NLP?',
    'text_mcq',
    '["Named Entity Recognition","Natural Entity Recognition","Network Entity Relationship","Neural Encoding Representation"]'::jsonb,
    'Named Entity Recognition',
    'medium',
    'Natural Language Processing',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does NER stand for in NLP?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which library is specifically designed for natural language processing in Python?',
    'text_mcq',
    '["NLTK","SpaCy","Transformers","All of the above"]'::jsonb,
    'All of the above',
    'medium',
    'Tools & Frameworks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which library is specifically designed for natural language processing in Python?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is Pandas primarily used for?',
    'text_mcq',
    '["Data manipulation and analysis","Machine learning models","Web development","Game development"]'::jsonb,
    'Data manipulation and analysis',
    'easy',
    'Tools & Frameworks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is Pandas primarily used for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which AI winter occurred in the 1970s due to unfulfilled promises?',
    'text_mcq',
    '["First AI Winter","Second AI Winter","Digital Revolution","AI Spring"]'::jsonb,
    'First AI Winter',
    'medium',
    'AI History',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which AI winter occurred in the 1970s due to unfulfilled promises?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Who is considered the father of theoretical computer science and artificial intelligence?',
    'text_mcq',
    '["Alan Turing","John McCarthy","Marvin Minsky","Claude Shannon"]'::jsonb,
    'Alan Turing',
    'hard',
    'AI History',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Who is considered the father of theoretical computer science and artificial intelligence?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''stable diffusion''?',
    'text_mcq',
    '["A text-to-image model","A type of neural network","A training algorithm","A data processing technique"]'::jsonb,
    'A text-to-image model',
    'medium',
    'Generative AI',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''stable diffusion''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''latent space'' refer to in generative models?',
    'text_mcq',
    '["A compressed representation of data","A hidden layer in neural networks","A storage space for models","A type of memory unit"]'::jsonb,
    'A compressed representation of data',
    'hard',
    'Generative AI',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''latent space'' refer to in generative models?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the name of the agent''s strategy in reinforcement learning?',
    'text_mcq',
    '["Policy","Strategy","Plan","Method"]'::jsonb,
    'Policy',
    'easy',
    'Reinforcement Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the name of the agent''s strategy in reinforcement learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does the ''reward'' represent in reinforcement learning?',
    'text_mcq',
    '["Feedback from the environment","The agent''s goal","A punishment signal","Learning rate"]'::jsonb,
    'Feedback from the environment',
    'medium',
    'Reinforcement Learning',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does the ''reward'' represent in reinforcement learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''batch normalization'' used for?',
    'text_mcq',
    '["Stabilizing training","Increasing model size","Reducing data size","Speeding up inference"]'::jsonb,
    'Stabilizing training',
    'hard',
    'Neural Networks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''batch normalization'' used for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the purpose of the loss function?',
    'text_mcq',
    '["Measure model performance","Update weights","Process data","Store parameters"]'::jsonb,
    'Measure model performance',
    'medium',
    'Neural Networks',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the purpose of the loss function?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the primary goal of AI Safety research?',
    'text_mcq',
    '["Make AI systems faster","Ensure AI systems are beneficial and controllable","Reduce AI development costs","Increase AI processing power"]'::jsonb,
    'Ensure AI systems are beneficial and controllable',
    'easy',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the primary goal of AI Safety research?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does the ''Alignment Problem'' refer to in AI safety?',
    'text_mcq',
    '["Aligning neural network layers","Making sure AI goals match human values","Aligning training data formats","Synchronizing multiple AI systems"]'::jsonb,
    'Making sure AI goals match human values',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does the ''Alignment Problem'' refer to in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''Instrumental Convergence'' in AI safety?',
    'text_mcq',
    '["Different AI architectures performing similarly","Diverse AI systems likely pursuing similar subgoals","Convergence of training algorithms","Merging of different AI models"]'::jsonb,
    'Diverse AI systems likely pursuing similar subgoals',
    'hard',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''Instrumental Convergence'' in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is algorithmic bias?',
    'text_mcq',
    '["When algorithms prefer certain programming languages","Systematic errors that create unfair outcomes","Bias in choosing machine learning algorithms","Preference for certain hardware architectures"]'::jsonb,
    'Systematic errors that create unfair outcomes',
    'easy',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is algorithmic bias?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which principle ensures AI decisions can be explained to humans?',
    'text_mcq',
    '["Transparency","Fairness","Accountability","Explainability"]'::jsonb,
    'Explainability',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which principle ensures AI decisions can be explained to humans?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the purpose of AI auditing?',
    'text_mcq',
    '["To check AI system finances","To evaluate AI performance and compliance","To audit AI training data size","To verify hardware specifications"]'::jsonb,
    'To evaluate AI performance and compliance',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the purpose of AI auditing?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Value Loading Problem'' in AI alignment?',
    'text_mcq',
    '["Loading training values into neural networks","Specifying human values precisely for AI systems","Loading ethical guidelines into AI memory","Value optimization in reinforcement learning"]'::jsonb,
    'Specifying human values precisely for AI systems',
    'hard',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Value Loading Problem'' in AI alignment?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''XAI'' stand for?',
    'text_mcq',
    '["Extended Artificial Intelligence","Explainable Artificial Intelligence","Expert Artificial Intelligence","Experimental Artificial Intelligence"]'::jsonb,
    'Explainable Artificial Intelligence',
    'easy',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''XAI'' stand for?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'Which organization published the ''Asilomar AI Principles''?',
    'text_mcq',
    '["European Union","Future of Life Institute","United Nations","IEEE"]'::jsonb,
    'Future of Life Institute',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'Which organization published the ''Asilomar AI Principles''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''reward hacking'' in reinforcement learning?',
    'text_mcq',
    '["Breaking into reward systems","AI finding unintended ways to maximize rewards","Stealing reward functions from other AIs","Modifying reward values during training"]'::jsonb,
    'AI finding unintended ways to maximize rewards',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''reward hacking'' in reinforcement learning?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Trolley Problem'' in the context of AI ethics?',
    'text_mcq',
    '["A problem in optimizing trolley logistics","An ethical dilemma about autonomous vehicle decisions","A issue with training data transportation","A problem in robotic movement optimization"]'::jsonb,
    'An ethical dilemma about autonomous vehicle decisions',
    'hard',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Trolley Problem'' in the context of AI ethics?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the EU AI Act?',
    'text_mcq',
    '["A European regulation for artificial intelligence","A law about AI in acting and entertainment","A treaty for AI research collaboration","A standard for AI hardware manufacturing"]'::jsonb,
    'A European regulation for artificial intelligence',
    'easy',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the EU AI Act?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''corrigibility'' mean in AI safety?',
    'text_mcq',
    '["Ability to correct spelling errors","Willingness to be shut down or corrected","Capacity for self-repair","Ability to correct other AIs"]'::jsonb,
    'Willingness to be shut down or corrected',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''corrigibility'' mean in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''differential privacy'' in AI?',
    'text_mcq',
    '["Different privacy settings for various users","A system for measuring privacy protection","Privacy that varies by geographic location","Different privacy laws for AI systems"]'::jsonb,
    'A system for measuring privacy protection',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''differential privacy'' in AI?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Precautionary Principle'' in AI governance?',
    'text_mcq',
    '["Taking preventive action in the face of uncertainty","Being cautious when programming AI","Principle of preparing for AI failures","Guideline for AI risk assessment"]'::jsonb,
    'Taking preventive action in the face of uncertainty',
    'hard',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Precautionary Principle'' in AI governance?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is a ''sandbox'' in AI safety testing?',
    'text_mcq',
    '["A controlled testing environment","A type of neural network architecture","A playground for AI algorithms","A secure data storage system"]'::jsonb,
    'A controlled testing environment',
    'easy',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is a ''sandbox'' in AI safety testing?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''FATE'' stand for in AI ethics?',
    'text_mcq',
    '["Fairness, Accountability, Transparency, Ethics","Future AI Technology Evaluation","Federated AI Training Environment","Fast Algorithmic Testing Engine"]'::jsonb,
    'Fairness, Accountability, Transparency, Ethics',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''FATE'' stand for in AI ethics?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the role of an ''AI Ethics Board''?',
    'text_mcq',
    '["To oversee ethical AI development and deployment","To board AI systems for training","To manage AI hardware ethics","To evaluate AI algorithm efficiency"]'::jsonb,
    'To oversee ethical AI development and deployment',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the role of an ''AI Ethics Board''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Orthogonality Thesis'' in AI safety?',
    'text_mcq',
    '["Any level of intelligence can be combined with any goal","AI systems should have orthogonal decision processes","Intelligence and safety are orthogonal concerns","AI training should use orthogonal matrices"]'::jsonb,
    'Any level of intelligence can be combined with any goal',
    'hard',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Orthogonality Thesis'' in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''model cards'' in responsible AI?',
    'text_mcq',
    '["Documentation for model capabilities and limitations","Hardware cards for AI processors","Credit cards for AI purchases","Identification cards for AI systems"]'::jsonb,
    'Documentation for model capabilities and limitations',
    'easy',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''model cards'' in responsible AI?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''red teaming'' refer to in AI safety?',
    'text_mcq',
    '["Stress-testing AI systems by simulating attacks","Using red-colored teams for AI development","Testing AI with red-colored data","Emergency response teams for AI failures"]'::jsonb,
    'Stress-testing AI systems by simulating attacks',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''red teaming'' refer to in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''distributional shift'' in AI safety context?',
    'text_mcq',
    '["When test data differs from training data","Shifting AI processing to different distributions","Changing the distribution of AI workloads","Shift in AI market share distribution"]'::jsonb,
    'When test data differs from training data',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''distributional shift'' in AI safety context?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''right to explanation'' in AI regulations?',
    'text_mcq',
    '["Users'' right to understand AI decisions affecting them","AI''s right to explain its actions","Right to explain AI algorithms publicly","Legal right to explain AI concepts"]'::jsonb,
    'Users'' right to understand AI decisions affecting them',
    'hard',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''right to explanation'' in AI regulations?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is an ''AI impact assessment''?',
    'text_mcq',
    '["Evaluation of AI system''s potential effects","Assessment of AI''s computational impact","Measuring AI''s environmental impact","Evaluating AI''s economic impact only"]'::jsonb,
    'Evaluation of AI system''s potential effects',
    'easy',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is an ''AI impact assessment''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''specification gaming'' in AI safety?',
    'text_mcq',
    '["AI exploiting loopholes in its specifications","Playing games with AI specifications","Gaming industry specifications for AI","Specifying games for AI training"]'::jsonb,
    'AI exploiting loopholes in its specifications',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''specification gaming'' in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What does ''consentful AI'' refer to?',
    'text_mcq',
    '["AI systems that respect user consent","AI that gives consent for data use","Mutual consent between AIs","Consent for AI to make decisions"]'::jsonb,
    'AI systems that respect user consent',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What does ''consentful AI'' refer to?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Bletchley Declaration'' related to?',
    'text_mcq',
    '["International cooperation on AI safety","Declaration of AI independence","Historical AI development milestone","Declaration of AI rights"]'::jsonb,
    'International cooperation on AI safety',
    'hard',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Bletchley Declaration'' related to?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is a ''kill switch'' in AI safety?',
    'text_mcq',
    '["Emergency shutdown mechanism","Switch to kill AI processes","Circuit breaker for AI hardware","Software to terminate AI tasks"]'::jsonb,
    'Emergency shutdown mechanism',
    'easy',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is a ''kill switch'' in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''algorithmic accountability''?',
    'text_mcq',
    '["Holding developers responsible for algorithmic outcomes","AI algorithms being accountable to each other","Accountability for algorithm speed","Financial accountability for AI systems"]'::jsonb,
    'Holding developers responsible for algorithmic outcomes',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''algorithmic accountability''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the purpose of ''AI certification''?',
    'text_mcq',
    '["Formal verification of AI system safety and compliance","Certifying AI developers'' skills","Certification for AI hardware","Quality certification for AI data"]'::jsonb,
    'Formal verification of AI system safety and compliance',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the purpose of ''AI certification''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''mesa-optimization'' in AI safety?',
    'text_mcq',
    '["When AI develops internal optimization processes","Optimizing mesa-level neural networks","Multi-level optimization strategies","Optimization for mesa-scale problems"]'::jsonb,
    'When AI develops internal optimization processes',
    'hard',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''mesa-optimization'' in AI safety?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''data sovereignty'' in AI context?',
    'text_mcq',
    '["Control over how data is collected and used","Sovereign data for AI training","Data ownership by governments","AI''s control over its own data"]'::jsonb,
    'Control over how data is collected and used',
    'easy',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''data sovereignty'' in AI context?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What are ''AI safety standards''?',
    'text_mcq',
    '["Guidelines for safe AI development and deployment","Standards for AI processing speed","Safety standards for AI hardware","Standards for AI energy consumption"]'::jsonb,
    'Guidelines for safe AI development and deployment',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What are ''AI safety standards''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''out-of-distribution detection''?',
    'text_mcq',
    '["Identifying inputs different from training data","Detecting data outside geographic distribution","Finding distribution errors in datasets","Detecting when AI distributes outputs"]'::jsonb,
    'Identifying inputs different from training data',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''out-of-distribution detection''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''black box problem'' in AI?',
    'text_mcq',
    '["Difficulty understanding how AI reaches decisions","Problem with black-colored AI hardware","Issue with unlabeled training data","Problem of AI working in dark environments"]'::jsonb,
    'Difficulty understanding how AI reaches decisions',
    'hard',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''black box problem'' in AI?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is an ''AI ethics framework''?',
    'text_mcq',
    '["Structured approach to ethical AI development","Framework for AI algorithm design","Structural framework for AI hardware","Framework for AI testing environments"]'::jsonb,
    'Structured approach to ethical AI development',
    'easy',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is an ''AI ethics framework''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''adversarial robustness''?',
    'text_mcq',
    '["Resistance to malicious inputs designed to fool AI","Robustness against adversarial attacks in games","Strength of AI in competitive environments","Robustness against hardware failures"]'::jsonb,
    'Resistance to malicious inputs designed to fool AI',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''adversarial robustness''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''meaningful human control'' in autonomous systems?',
    'text_mcq',
    '["Humans retaining ultimate authority and understanding","Complete human control over all AI operations","Humans controlling AI through meaningful gestures","AI systems controlling humans meaningfully"]'::jsonb,
    'Humans retaining ultimate authority and understanding',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''meaningful human control'' in autonomous systems?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''Collusion Problem'' in multi-agent AI systems?',
    'text_mcq',
    '["AI agents cooperating in ways harmful to humans","AI systems colluding to improve performance","Problem of AI agents communicating secretly","Collusion between AI developers and regulators"]'::jsonb,
    'AI agents cooperating in ways harmful to humans',
    'hard',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''Collusion Problem'' in multi-agent AI systems?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''fail-safe'' design in AI systems?',
    'text_mcq',
    '["Design that defaults to safe state on failure","Design that never fails","Safety features that fail gracefully","Design with multiple failure points"]'::jsonb,
    'Design that defaults to safe state on failure',
    'easy',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''fail-safe'' design in AI systems?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''algorithmic transparency''?',
    'text_mcq',
    '["Ability to understand how algorithms make decisions","Transparent code in algorithms","Algorithms that are visually transparent","Transparency in algorithm selection"]'::jsonb,
    'Ability to understand how algorithms make decisions',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''algorithmic transparency''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''AI liability''?',
    'text_mcq',
    '["Legal responsibility for AI system actions","AI''s liability to make errors","Financial liability of AI companies","Liability insurance for AI systems"]'::jsonb,
    'Legal responsibility for AI system actions',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''AI liability''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''goal misgeneralization'' in AI?',
    'text_mcq',
    '["AI pursuing wrong goals that satisfy training criteria","Misgeneralizing goals across different domains","AI misunderstanding human goals","Generalization of goals to wrong contexts"]'::jsonb,
    'AI pursuing wrong goals that satisfy training criteria',
    'hard',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''goal misgeneralization'' in AI?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''privacy by design'' in AI systems?',
    'text_mcq',
    '["Building privacy protections into AI from the start","Designing AI for private use only","Privacy-focused AI architecture design","Designing AI that respects user privacy settings"]'::jsonb,
    'Building privacy protections into AI from the start',
    'easy',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''privacy by design'' in AI systems?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''algorithmic impact assessment''?',
    'text_mcq',
    '["Evaluating potential effects of algorithmic systems","Assessing impact of algorithms on processing speed","Impact of algorithms on hardware performance","Assessment of algorithm efficiency impact"]'::jsonb,
    'Evaluating potential effects of algorithmic systems',
    'medium',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''algorithmic impact assessment''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''monitoring'' in AI safety contexts?',
    'text_mcq',
    '["Continuous observation of AI system behavior","Monitoring AI training progress","Watching AI hardware performance","Monitoring AI energy consumption"]'::jsonb,
    'Continuous observation of AI system behavior',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''monitoring'' in AI safety contexts?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is the ''contextual integrity'' framework for privacy?',
    'text_mcq',
    '["Privacy appropriate to specific social contexts","Integrity of data across different contexts","Context-based data integrity checks","Framework for maintaining data context"]'::jsonb,
    'Privacy appropriate to specific social contexts',
    'hard',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is the ''contextual integrity'' framework for privacy?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''AI compliance''?',
    'text_mcq',
    '["Adherence to laws and regulations governing AI","Compliance with AI technical standards","AI systems complying with user commands","Compliance in AI training procedures"]'::jsonb,
    'Adherence to laws and regulations governing AI',
    'easy',
    'AI Governance',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''AI compliance''?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''interruptibility'' in AI systems?',
    'text_mcq',
    '["Ability to safely interrupt AI operations","Capability to interrupt other AIs","Feature for interrupting AI training","Ability to pause AI processing temporarily"]'::jsonb,
    'Ability to safely interrupt AI operations',
    'medium',
    'AI Safety',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''interruptibility'' in AI systems?'
);

INSERT INTO public.questions (
    question_text,
    question_type,
    options,
    correct_answer,
    difficulty,
    category,
    created_by,
    is_active,
    is_verified,
    points,
    time_limit_seconds
)
SELECT
    'What is ''value-sensitive design'' in AI?',
    'text_mcq',
    '["Design approach that incorporates human values","Design sensitive to numerical values","AI that understands human values","Design based on value optimization"]'::jsonb,
    'Design approach that incorporates human values',
    'medium',
    'AI Ethics',
    COALESCE((SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1), (SELECT id FROM public.profiles LIMIT 1)),
    true,
    true,
    10,
    30
WHERE NOT EXISTS (
    SELECT 1 FROM public.questions WHERE question_text = 'What is ''value-sensitive design'' in AI?'
);
