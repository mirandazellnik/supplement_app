import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Image } from "expo-image"
import { spacing } from "../styles/spacing";
import { colors } from "../styles/colors";
import CrossPlatformSpinner from "./CrossPlatformSpinner";


const ProductImageById = ({ loading, productId, style={}, pushRight=false }) => {
  const [imgError, setImgError] = useState(false);

  const defaultImg = require("../assets/images/No_Image_Available.jpg");

  // Reset error when productId changes
  useEffect(() => {
    setImgError(false);
  }, [productId]);

  return loading ? (
    <CrossPlatformSpinner size={style.width || 80} color={colors.primary} style={{ marginRight: style.marginRight || (pushRight ? spacing.md : 0) }} />
  ) : (
    <Image
      source={imgError ? defaultImg : { uri: `https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/${productId}.jpg` }}
      onError={(e) => {
        console.log('Image not found:', e.nativeEvent.error);
        setImgError(true);
      }}
      style={[
        { width: 80, height: 80, borderRadius: 8, marginRight: style.marginRight || (pushRight ? spacing.md : 0), backgroundColor: colors.surface },
        style
      ]}
    />
  );
};

export default ProductImageById;