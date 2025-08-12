def analyze_supplements(supplements):
    # Placeholder for GPT logic — right now, just returns fake ratings
    results = []
    for supp in supplements:
        results.append({
            "name": supp,
            "rating": 4.5,  # fake value
            "link": f"https://example.com/{supp.replace(' ', '-')}"
        })
    return {"results": results}