# RAWCONNECT — Validation phone, amount

import re
from decimal import Decimal, InvalidOperation


def normalize_phone(phone: str) -> str:
    """
    Normalise un numéro pour la recherche en base (RDC: 0812345678).
    Enlève espaces/tirets/+, puis si 9 chiffres commençant par 8, ajoute le 0.
    """
    if not phone:
        return ""
    cleaned = re.sub(r"[\s\-+]", "", phone)
    if not cleaned.isdigit():
        return phone
    if len(cleaned) == 9 and cleaned.startswith("8"):
        return "0" + cleaned
    return cleaned


def validate_phone(phone: str) -> tuple[bool, str]:
    """
    Valide un numéro de téléphone.
    Format attendu: 9-12 chiffres (ex: 0812345678, 243900000000).
    Retourne (is_valid, error_message).
    """
    if not phone:
        return False, "Le numéro de téléphone est requis"
    
    # Nettoyer (enlever espaces, tirets, +)
    cleaned = re.sub(r"[\s\-+]", "", phone)
    
    # Vérifier que ce sont uniquement des chiffres
    if not cleaned.isdigit():
        return False, "Le numéro doit contenir uniquement des chiffres"
    
    # Longueur: 9-12 chiffres
    if len(cleaned) < 9 or len(cleaned) > 12:
        return False, "Le numéro doit contenir entre 9 et 12 chiffres"
    
    return True, ""


def validate_amount(amount: float | Decimal | str, min_value: float = 0.01, max_value: float = 1000000.0) -> tuple[bool, str]:
    """
    Valide un montant.
    Retourne (is_valid, error_message).
    """
    try:
        if isinstance(amount, str):
            amount = Decimal(amount)
        elif isinstance(amount, float):
            amount = Decimal(str(amount))
        elif isinstance(amount, Decimal):
            pass
        else:
            return False, "Le montant doit être un nombre"
        
        if amount <= 0:
            return False, f"Le montant doit être supérieur à {min_value}"
        
        if amount < Decimal(str(min_value)):
            return False, f"Le montant minimum est {min_value}"
        
        if amount > Decimal(str(max_value)):
            return False, f"Le montant maximum est {max_value}"
        
        # Vérifier décimales (max 2)
        if amount.as_tuple().exponent < -2:
            return False, "Le montant ne peut avoir plus de 2 décimales"
        
        return True, ""
    
    except (InvalidOperation, ValueError, TypeError):
        return False, "Le montant n'est pas un nombre valide"


def validate_pin(pin: str) -> tuple[bool, str]:
    """
    Valide un PIN (4 chiffres).
    Retourne (is_valid, error_message).
    """
    if not pin:
        return False, "Le PIN est requis"
    
    if not pin.isdigit():
        return False, "Le PIN doit contenir uniquement des chiffres"
    
    if len(pin) != 4:
        return False, "Le PIN doit contenir exactement 4 chiffres"
    
    return True, ""


def validate_activity_type(activity: str) -> tuple[bool, str]:
    """
    Valide un type d'activité.
    Retourne (is_valid, error_message).
    """
    allowed = ["marché", "étudiant", "agriculture", "artisan", "commerce", "autre"]
    if activity.lower() not in [a.lower() for a in allowed]:
        return False, f"Type d'activité invalide. Valeurs autorisées: {', '.join(allowed)}"
    return True, ""
