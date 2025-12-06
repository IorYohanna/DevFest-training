import re
import httpx
import os
import json
from typing import Dict, List, Any
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ✅ Clé API Groq (gratuit, 14,400 requêtes/jour)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

class HallucinationDetector:
    def __init__(self):
        if not GROQ_API_KEY:
            print("GROQ_API_KEY manquante dans .env")
            print("Obtenez une clé gratuite sur: https://console.groq.com")
        
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Modèles disponibles (gratuits) - MISE À JOUR 2024
        self.model = "llama-3.3-70b-versatile"
        
        self.stats = {
            "total_analyses": 0,
            "hallucinations_detected": 0,
            "corrections_made": 0,
            "api_successes": 0,
            "api_failures": 0
        }
        
        print(f"✅ HallucinationDetector initialized")
        print(f"🚀 Provider: Groq AI (Ultra rapide)")
        print(f"🤖 Model: {self.model}")

    async def detect_hallucination(self, prompt: str) -> Dict[str, Any]:
        """Point d'entrée principal"""
        self.stats["total_analyses"] += 1
        
        try:
            verification_results = await self._verify_with_groq(prompt)
            
            is_hallucination = verification_results["is_hallucination"]
            confidence_score = verification_results["confidence"]

            if is_hallucination:
                self.stats["hallucinations_detected"] += 1
                self.stats["corrections_made"] += 1
            
            corrected_text = verification_results.get("corrected_text", prompt)
            correction_segments = self._generate_segments(prompt, corrected_text, verification_results)
            rag_sources = verification_results.get("sources", [])

            return {
                "original_prompt": prompt,
                "ai_analysis": {
                    "is_hallucination": is_hallucination,
                    "confidence_score": confidence_score,
                    "corrected_text": corrected_text,
                    "correction_segments": correction_segments,
                    "rag_sources": rag_sources,
                    "facts_checked": len(verification_results.get("facts", [])),
                    "timestamp": datetime.now().isoformat()
                }
            }
        
        except Exception as e:
            print(f"❌ Erreur détection: {str(e)}")
            raise Exception(f"Erreur d'analyse: {str(e)}")

    async def _verify_with_groq(self, prompt: str) -> Dict[str, Any]:
        """Appel à l'API Groq (ultra rapide, <1s)"""
        
        try:
            print(f"\n{'='*60}")
            print(f"🚀 Appel Groq API")
            print(f"📝 Prompt: {prompt}")
            print(f"{'='*60}\n")
            
            # Prompt structuré pour obtenir un JSON
            system_prompt = """You are a fact-checking AI. Analyze statements for factual accuracy.

Respond ONLY with a JSON object in this exact format:
{
  "is_correct": true or false,
  "confidence": 0.XX (between 0 and 1),
  "explanation": "Brief explanation of why it's correct or incorrect",
  "corrected_version": "If incorrect, provide the correct information. If correct, repeat the original statement."
}

Do not include any other text, markdown formatting, or code blocks. Only the raw JSON."""

            user_prompt = f'Analyze this statement: "{prompt}"'
            
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1,
                "max_tokens": 500,
                "response_format": {"type": "json_object"}  # Force JSON
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.groq_url,
                    json=payload,
                    headers=self.headers
                )
                
                print(f"📥 Status: {response.status_code}")
                
                if response.status_code == 401:
                    raise Exception("❌ Clé API Groq invalide. Vérifiez votre .env")
                
                if response.status_code == 429:
                    raise Exception("⏳ Limite de requêtes atteinte. Réessayez dans 1 minute.")
                
                if response.status_code != 200:
                    error_text = response.text[:300]
                    raise Exception(f"Erreur API Groq ({response.status_code}): {error_text}")
                
                result = response.json()
                
                # Extraction de la réponse
                ai_response = result["choices"][0]["message"]["content"]
                
                print(f"✅ Réponse reçue:\n{ai_response}\n")
                
                # Parse le JSON
                try:
                    parsed = json.loads(ai_response)
                except json.JSONDecodeError:
                    # Si le JSON est mal formé, essaye de l'extraire
                    json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                    else:
                        raise Exception("Réponse IA invalide (pas de JSON)")
                
                # Construction de la réponse
                is_incorrect = not parsed.get("is_correct", True)
                confidence = float(parsed.get("confidence", 0.8))
                explanation = parsed.get("explanation", "")
                corrected = parsed.get("corrected_version", prompt)
                
                self.stats["api_successes"] += 1
                
                return {
                    "is_hallucination": is_incorrect,
                    "confidence": confidence,
                    "corrected_text": corrected,
                    "facts": [prompt],
                    "sources": [{
                        "id": 1,
                        "title": f"Groq AI ({self.model})",
                        "validity": "hallucination" if is_incorrect else "correct",
                        "snippet": explanation
                    }],
                    "ai_explanation": explanation
                }
                
        except httpx.TimeoutException:
            self.stats["api_failures"] += 1
            raise Exception("⏱️ Timeout de l'API Groq")
        except httpx.ConnectError:
            self.stats["api_failures"] += 1
            raise Exception("🔌 Impossible de se connecter à Groq")
        except Exception as e:
            self.stats["api_failures"] += 1
            raise Exception(f"Erreur Groq API: {str(e)}")

    def _generate_segments(self, original: str, corrected: str, verification: Dict) -> List[Dict]:
        """Génère les segments de différence"""
        if not verification["is_hallucination"]:
            return [{"text": original, "type": "neutral"}]

        # Si trop différent, retourne juste la correction
        if abs(len(corrected) - len(original)) > len(original) * 1.5:
            return [{
                "text": corrected, 
                "type": "correct", 
                "explanation": "Correction complète"
            }]

        # Comparaison mot par mot
        segments = []
        o_words = original.split()
        c_words = corrected.split()

        for i in range(max(len(o_words), len(c_words))):
            if i < len(o_words) and i < len(c_words):
                if o_words[i].lower() == c_words[i].lower():
                    segments.append({"text": o_words[i] + " ", "type": "neutral"})
                else:
                    segments.append({
                        "text": c_words[i] + " ",
                        "type": "correct",
                        "explanation": f"'{o_words[i]}' → '{c_words[i]}'"
                    })
            elif i < len(c_words):
                segments.append({
                    "text": c_words[i] + " ", 
                    "type": "correct",
                    "explanation": "Ajout"
                })

        return segments if segments else [{"text": corrected, "type": "correct"}]

    def get_statistics(self) -> Dict[str, Any]:
        """Statistiques d'utilisation"""
        total_calls = self.stats["api_successes"] + self.stats["api_failures"]
        success_rate = (self.stats["api_successes"] / max(total_calls, 1)) * 100
        
        return {
            "stats": self.stats,
            "api_success_rate": round(success_rate, 2),
            "detection_rate": round(
                (self.stats["hallucinations_detected"] / max(self.stats["total_analyses"], 1)) * 100, 
                2
            ),
            "model": self.model
        }


# Instance globale
detector = HallucinationDetector()

async def analyze_hallucination(prompt: str) -> Dict[str, Any]:
    """Point d'entrée pour l'analyse avec Groq"""
    return await detector.detect_hallucination(prompt)