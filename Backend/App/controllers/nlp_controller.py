import torch
from core.model_loader import ModelLoader

class NLPController:

    COMPLEXITY_LABELS = {0: "simple", 1: "medium", 2: "complex"}
    TASK_TYPE_LABELS = {0: "summary", 1: "code", 2: "explanation"}
    REQUIRES_LABELS = {0: "yes", 1: "no"}

    # Scores pondérés pour calcul du coût final
    COMPLEXITY_SCORES = {"simple": 0.2, "medium": 0.5, "complex": 0.8}
    TASK_TYPE_SCORES = {"summary": 0.2, "code": 0.7, "explanation": 0.4}
    REQUIRES_SCORES = {"yes": 1.0, "no": 0.3}

    FINAL_WEIGHTS = {
        "complexity": 0.4,
        "task_type": 0.4,
        "requires_large_model": 0.2
    }

    @staticmethod
    def classify_text(text: str):
        tokenizer = ModelLoader.get_tokenizer()
        model = ModelLoader.get_model()

        # Tokenisation
        inputs = tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            padding=True
        )

        with torch.no_grad():
            outputs = model(**inputs)  # Multi-head model

        # --- Probabilités pour chaque tête ---
        probs_complexity = torch.softmax(outputs["complexity"], dim=0).tolist()
        probs_task_type = torch.softmax(outputs["task_type"], dim=0).tolist()
        probs_requires = torch.softmax(outputs["requires_large_model"], dim=0).tolist()

        # --- Map avec labels ---
        complexity = {NLPController.COMPLEXITY_LABELS[i]: probs_complexity[i] for i in range(3)}
        task_type = {NLPController.TASK_TYPE_LABELS[i]: probs_task_type[i] for i in range(3)}
        requires_large_model = {NLPController.REQUIRES_LABELS[i]: probs_requires[i] for i in range(2)}

        # --- Calcul du score final (coût) ---
        complexity_score = sum(complexity[label] * NLPController.COMPLEXITY_SCORES[label] for label in complexity)
        task_score = sum(task_type[label] * NLPController.TASK_TYPE_SCORES[label] for label in task_type)
        requires_score = sum(requires_large_model[label] * NLPController.REQUIRES_SCORES[label] for label in requires_large_model)

        final_cost = (
            NLPController.FINAL_WEIGHTS["complexity"] * complexity_score +
            NLPController.FINAL_WEIGHTS["task_type"] * task_score +
            NLPController.FINAL_WEIGHTS["requires_large_model"] * requires_score
        )

        # --- Classe prédite pour la complexité (optionnel) ---
        predicted_class = int(torch.argmax(outputs["complexity"]))
        predicted_label = NLPController.COMPLEXITY_LABELS[predicted_class]

        return {
            "text": text,
            "complexity": complexity,
            "task_type": task_type,
            "requires_large_model": requires_large_model,
            "predicted_complexity_class": predicted_class,
            "predicted_complexity_label": predicted_label,
            "estimated_cost_percent": round(final_cost * 100, 1)  # en pourcentage
        }