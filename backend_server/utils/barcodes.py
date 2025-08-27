import re

def expand_upce(upce):
    """
    Expand a 6-digit UPC-E code to a 12-digit UPC-A code.
    Supports standard UPC-E compression rules.
    """
    if len(upce) != 6:
        raise ValueError("UPC-E must be 6 digits")
    
    number_system = "0"  # assume number system 0
    d = upce
    if d[-1] in "012":
        # Manufacturer code ends with 0,1,2
        upca = number_system + d[0:2] + d[-1] + "0000" + d[2:5]
    elif d[-1] == "3":
        upca = number_system + d[0:3] + "00000" + d[3:5]
    elif d[-1] == "4":
        upca = number_system + d[0:4] + "00000" + d[4]
    else:
        upca = number_system + d[0:5] + "0000" + d[5]
    return upca

def format_barcode(barcode: str) -> str:
    # Remove all non-digit characters
    barcode = re.sub(r'\D', '', barcode)

    # Detect barcode type
    if len(barcode) == 12:
        # UPC-A
        return f"{barcode[0]}%20{barcode[1:6]}%20{barcode[6:11]}%20{barcode[11]}"
    elif len(barcode) == 6:
        # UPC-E
        upca = expand_upce(barcode)
        return f"{upca[0]}%20{upca[1:6]}%20{upca[6:11]}%20{upca[11]}"
    elif len(barcode) in (8, 13):
        # EAN-8 or EAN-13
        print(f"EAN barcode detected: {barcode}")
        return barcode
    else:
        raise ValueError(f"Unrecognized barcode length: {len(barcode)}")
