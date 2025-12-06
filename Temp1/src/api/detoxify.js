const API_BASE_URL = "http://localhost:8000/api/v1";

export const fetchStats = async ({ setStats }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    setStats(data);
  } catch (err) {
    console.error("Erreur de récupération des stats:", err);
  }
};

// Analyser un texte
export const analyzeText = async (text, threshold) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, threshold }),
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Erreur d'analyse:", err);
    throw err;
  }
};

// Filtrer un texte
export const filterText = async (text, threshold) => {
  try {
    const response = await fetch(`${API_BASE_URL}/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, threshold }),
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Erreur de filtrage:", err);
    throw err;
  }
};
