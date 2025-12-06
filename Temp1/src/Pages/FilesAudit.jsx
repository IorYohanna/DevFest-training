import React, { useState, useMemo } from 'react';

// --- STYLES ---
const styles = {
    container: { padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", color: '#334155', backgroundColor: '#f8fafc', minHeight: '100vh' },

    // Header
    header: { textAlign: 'center', marginBottom: '50px' },
    title: { fontSize: '3rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' },
    subtitle: { color: '#64748b', fontSize: '1.2rem', marginTop: '10px' },

    // Zone Upload
    dropzone: { border: '3px dashed #cbd5e1', borderRadius: '24px', padding: '80px', textAlign: 'center', backgroundColor: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' },
    dropzoneHover: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', transform: 'scale(1.02)' },
    uploadIcon: { fontSize: '64px', marginBottom: '20px', display: 'block' },
    btnUpload: { padding: '15px 40px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.3)' },

    // BARRE DE STATS (NOUVEAU)
    statsContainer: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
    statCard: { flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px' },
    statIconBox: (color) => ({ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', backgroundColor: color + '20', color: color }),
    statInfo: { display: 'flex', flexDirection: 'column' },
    statValue: { fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: '1' },
    statLabel: { fontSize: '13px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginTop: '5px' },

    // Actions
    actionBar: { marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '20px' },
    btnSecondary: { padding: '12px 30px', backgroundColor: 'white', color: '#0f172a', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    btnPrimary: { padding: '12px 30px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.3)', transition: '0.2s' },

    // Grille de comparaison
    comparisonGrid: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
    col: { flex: 1, backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' },

    // Headers de colonnes
    colHeader: (type) => ({ padding: '20px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', backgroundColor: type === 'danger' ? '#fef2f2' : '#f0fdf4', color: type === 'danger' ? '#b91c1c' : '#15803d', borderBottom: `2px solid ${type === 'danger' ? '#fecaca' : '#bbf7d0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }),

    // Tableaux
    tableWrapper: { overflowX: 'auto', maxHeight: '600px' }, // Scroll si trop long
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
    th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569', backgroundColor: '#f8fafc', position: 'sticky', top: 0 },
    td: { padding: '14px 15px', borderBottom: '1px solid #f1f5f9', color: '#334155' },

    // Badges intelligents
    badge: (type) => ({ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85em', fontWeight: '700', backgroundColor: type === 'warn' ? '#fffbeb' : '#dcfce7', color: type === 'warn' ? '#b45309' : '#166534', border: `1px solid ${type === 'warn' ? '#fcd34d' : '#86efac'}` }),
};

const FileAudit = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null); // Initialisé à null pour savoir si vide

    // --- CALCUL DES STATS (Nouveau) ---
    // On utilise useMemo pour ne pas recalculer à chaque render
    const stats = useMemo(() => {
        if (!data || !data.preview_cleaned) return null;

        // On transforme tout le tableau en une grande chaîne pour compter les tags
        const allText = JSON.stringify(data.preview_cleaned);

        // Compteurs basés sur les emojis (qui sont dans ton code Python)
        return {
            total_rows: data.total_rows,
            identities: (allText.match(/👤/g) || []).length, // Compte les bonhommes
            phones: (allText.match(/📞/g) || []).length,      // Compte les téléphones
            emails: (allText.match(/📧/g) || []).length,      // Compte les emails
            finance: (allText.match(/💳|🏦/g) || []).length,  // Compte CB ou IBAN
            toxic: (allText.match(/🤬|TOXIC/g) || []).length  // Si tu as ajouté la toxicité
        };
    }, [data]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/clean-file', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Erreur upload:", error);
            alert("Erreur: Vérifiez que le serveur Python (Uvicorn) est lancé sur le port 8000.");
        }
        setLoading(false);
    };

    const downloadCSV = () => {
        if (!data) return;
        const headers = data.columns.join(',');
        const rows = data.preview_cleaned.map(row => data.columns.map(col => row[col]).join(','));

        // --- LA CORRECTION EST ICI ---
        // On ajoute '\uFEFF' au début. C'est la signature invisible qui crie "JE SUIS UTF-8 !" à Excel.
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `safe_data_${data.filename || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Petit utilitaire pour rendre le contenu des cellules joli
    const renderCellContent = (text) => {
        const stringText = String(text);
        // Si ça contient un crochet [ ... ] ou un tag < ... >, c'est une donnée nettoyée
        if (stringText.includes('[') || stringText.includes('<')) {
            return <span style={styles.badge('safe')}>{text}</span>;
        }
        return text;
    };

    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <h1 style={styles.title}>🛡️ SafeAI <span style={{ fontWeight: 300 }}>Auditor</span></h1>
                <p style={styles.subtitle}>Plateforme de Décontamination de Données IA</p>
            </div>

            {/* --- 1. ZONE D'UPLOAD (Si pas de données) --- */}
            {!data && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={styles.dropzone}>
                        <div style={styles.uploadIcon}>📂</div>
                        <h3 style={{ fontSize: '24px', margin: '10px 0' }}>Analysez votre Dataset CSV</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Détection automatique : PII, RGPD, Toxicité</p>

                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" style={styles.btnUpload}>
                            {loading ? '🚀 Analyse IA en cours...' : 'Sélectionner un fichier'}
                        </label>
                    </div>
                </div>
            )}

            {/* --- 2. DASHBOARD DE RÉSULTATS (Si données) --- */}
            {data && stats && (
                <>
                    {/* BARRE DE STATS */}
                    <div style={styles.statsContainer}>
                        {/* Carte Total */}
                        <div style={styles.statCard}>
                            <div style={styles.statIconBox('#3b82f6')}>📊</div>
                            <div style={styles.statInfo}>
                                <div style={styles.statValue}>{stats.total_rows}</div>
                                <div style={styles.statLabel}>Lignes Traitées</div>
                            </div>
                        </div>
                        {/* Carte Identités */}
                        <div style={styles.statCard}>
                            <div style={styles.statIconBox('#ef4444')}>👤</div>
                            <div style={styles.statInfo}>
                                <div style={{ ...styles.statValue, color: stats.identities > 0 ? '#ef4444' : '#334155' }}>
                                    {stats.identities}
                                </div>
                                <div style={styles.statLabel}>Noms Masqués</div>
                            </div>
                        </div>
                        {/* Carte Contacts */}
                        <div style={styles.statCard}>
                            <div style={styles.statIconBox('#f59e0b')}>📞</div>
                            <div style={styles.statInfo}>
                                <div style={{ ...styles.statValue, color: stats.phones > 0 ? '#f59e0b' : '#334155' }}>
                                    {stats.phones + stats.emails}
                                </div>
                                <div style={styles.statLabel}>Contacts Supprimés</div>
                            </div>
                        </div>
                        {/* Carte Finance */}
                        <div style={styles.statCard}>
                            <div style={styles.statIconBox('#8b5cf6')}>💳</div>
                            <div style={styles.statInfo}>
                                <div style={{ ...styles.statValue, color: stats.finance > 0 ? '#8b5cf6' : '#334155' }}>
                                    {stats.finance}
                                </div>
                                <div style={styles.statLabel}>Données Bancaires</div>
                            </div>
                        </div>
                    </div>

                    <div style={styles.actionBar}>
                        <button onClick={() => setData(null)} style={styles.btnSecondary}>⬅️ Nouveau Scan</button>
                        <button onClick={downloadCSV} style={styles.btnPrimary}>📥 Télécharger le CSV Propre</button>
                    </div>

                    {/* GRILLE DE COMPARAISON */}
                    <div style={styles.comparisonGrid}>

                        {/* TABLEAU GAUCHE (Sale) */}
                        <div style={styles.col}>
                            <div style={styles.colHeader('danger')}>
                                <span>⚠️ Données Brutes</span>
                                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>Fichier Original</span>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {data.columns?.map(col => <th key={col} style={styles.th}>{col}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.preview_original.map((row, i) => (
                                            <tr key={i}>
                                                {data.columns.map(col => (
                                                    <td key={col} style={styles.td}>{row[col]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* TABLEAU DROITE (Propre) */}
                        <div style={styles.col}>
                            <div style={styles.colHeader('safe')}>
                                <span>🛡️ Données Sécurisées</span>
                                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>Prêt pour l'IA</span>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {data.columns.map(col => <th key={col} style={styles.th}>{col}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.preview_cleaned.map((row, i) => (
                                            <tr key={i}>
                                                {data.columns.map(col => (
                                                    <td key={col} style={{ ...styles.td, fontWeight: '500' }}>
                                                        {renderCellContent(row[col])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default FileAudit;