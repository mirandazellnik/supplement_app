import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { spacing } from "../styles/spacing";
import { colors } from "../styles/colors";

const ProductImageById = ({ productId, style = {}, pushRight = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const defaultImg = require("../assets/images/No_Image_Available.jpg");
  const uri = `https://api.ods.od.nih.gov/dsld/s3/pdf/thumbnails/${productId}.jpg`;

  // Reset states when productId changes
  useEffect(() => {
    setIsLoaded(false);
    setImgError(false);
  }, [productId]);

  return (
    <View
      style={[
        styles.container,
        { marginRight: style.marginRight || (pushRight ? spacing.md : 0) },
      ]}
    >
      {!isLoaded && !imgError && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.spinner}
        />
      )}

      <Image
        source={imgError ? defaultImg : { uri }}
        onError={() => setImgError(true)}
        onLoad={() => setIsLoaded(true)}
        style={[
          styles.image,
          style,
          !isLoaded && styles.hidden, // hide until loaded
        ]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  hidden: {
    position: "absolute",
    opacity: 0,
  },
  spinner: {
    position: "absolute",
    zIndex: 1,
  },
});

export default ProductImageById;
