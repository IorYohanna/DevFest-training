# Backend DevFestTraining

## Prérequis
vérifiez que vous avez python sur votre appareil.
De préférence python3.

```bash
    python3 --version #version 3 ou +
```

## Configuration des outils 

### création de venv

```bash
    python3 -m venv venv # venv est  le nom de votre dossier 
```
### activation de venv
- Linux ou MacOs
```bash
   source venv/bin/activate
```

- Windows(Cmd)
```bash
    venv\Scripts\activate.bat
```

- windows (PowerShell)
```bash
    venv\Scripts\Activate.ps1

```

### installation des dépendances

```bash
    pip install -r requirements.txt
```

### lancer le serveur

```bash
    uvicorn App.main:app --reload
```