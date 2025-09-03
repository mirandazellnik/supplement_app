from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from backend_server.utils.extensions import db

class ProductRating(db.Model):
    __tablename__ = "product_ratings"

    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(64), nullable=False, index=True)  # UPC or barcode
    source = db.Column(db.String(64), nullable=False)  # e.g., "nih", "openfoodfacts", etc.

    # Ratings structure:
    # {
    #   "cat1": {"rating": 8.5, "confidence": 3},
    #   "cat2": {"rating": 6.0, "confidence": 2},
    #   ...
    # }
    ratings = db.Column(JSON, nullable=False, default={})

    # optional metadata
    fetched_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    success = db.Column(db.Boolean, default=True)  # whether the API fetch worked

    # prevent duplicate entries for the same product/source
    __table_args__ = (db.UniqueConstraint("product_id", "source", name="_product_source_uc"),)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "source": self.source,
            "ratings": self.ratings,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
            "success": self.success,
        }
