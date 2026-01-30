# RAWCONNECT — Format d’erreur JSON uniforme

from typing import Any


def api_error(code: str, message: str, details: Any = None) -> dict:
    """
    Retourne un format d'erreur JSON uniforme pour l'API.
    
    Args:
        code: Code d'erreur (ex: "validation_error", "not_found")
        message: Message d'erreur lisible
        details: Détails optionnels (dict, liste, etc.)
    
    Returns:
        {
            "success": false,
            "error": {
                "code": "...",
                "message": "...",
                "details": ... (optionnel)
            }
        }
    """
    error = {
        "code": code,
        "message": message,
    }
    if details is not None:
        error["details"] = details
    
    return {
        "success": False,
        "error": error
    }


def api_success(data: Any = None, message: str | None = None) -> dict:
    """
    Retourne un format de succès JSON uniforme pour l'API.
    
    Args:
        data: Données à retourner (dict, liste, etc.)
        message: Message optionnel
    
    Returns:
        {
            "success": true,
            "data": ...,
            "message": ... (optionnel)
        }
    """
    result = {
        "success": True,
    }
    if data is not None:
        result["data"] = data
    if message:
        result["message"] = message
    
    return result
