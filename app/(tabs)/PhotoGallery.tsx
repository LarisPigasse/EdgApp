// Crea un nuovo file PhotoGallery.tsx con questo contenuto

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const THUMBNAIL_SIZE = 70;
const THUMBNAIL_SPACING = 8;

const PhotoGallery = ({ photos, onPhotoTaken }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState({});

  console.log("PhotoGallery riceve photos:", photos);
  console.log("PhotoGallery photos è un array?", Array.isArray(photos));
  console.log("PhotoGallery photos lunghezza:", photos?.length);

  if (!photos || photos.length === 0) {
    return (
      <View style={styles.noPhotosContainer}>
        <Text style={styles.noPhotosText}>Nessuna foto disponibiles</Text>
      </View>
    );
  }

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleImageLoad = (photoId) => {
    setLoading((prev) => ({ ...prev, [photoId]: false }));
  };

  const handleImageLoadStart = (photoId) => {
    setLoading((prev) => ({ ...prev, [photoId]: true }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Foto ({photos.length})</Text>
        {onPhotoTaken && (
          <TouchableOpacity style={styles.addButton} onPress={onPhotoTaken}>
            <Ionicons name="camera" size={18} color="#00AFFA" />
            <Text style={styles.addButtonText}>Nuova foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id || index}
            style={styles.thumbnailContainer}
            onPress={() => handlePhotoPress(photo)}
          >
            <View style={styles.thumbnail}>
              {loading[photo.id] && (
                <ActivityIndicator
                  style={styles.loader}
                  size="small"
                  color="#00AFFA"
                />
              )}
              <Image
                source={{ uri: photo.fullPath }}
                style={styles.thumbnailImage}
                onLoadStart={() => handleImageLoadStart(photo.id)}
                onLoad={() => handleImageLoad(photo.id)}
                resizeMode="cover"
              />
              <View style={styles.dateOverlay}>
                <Text style={styles.dateText}>
                  {new Date(photo.data_creazione).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal per visualizzare la foto a schermo intero */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Ionicons name="close-circle" size={36} color="white" />
          </TouchableOpacity>

          {selectedPhoto && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedPhoto.fullPath }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={styles.photoInfo}>
                <Text style={styles.photoDate}>
                  Scattata il:{" "}
                  {new Date(selectedPhoto.data_creazione).toLocaleString()}
                </Text>
                {selectedPhoto.nota && (
                  <Text style={styles.photoNote}>
                    Nota: {selectedPhoto.nota}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 16,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  addButtonText: {
    color: "#00AFFA",
    fontSize: 12,
    marginLeft: 4,
  },
  scrollView: {
    flexDirection: "row",
  },
  thumbnailContainer: {
    marginRight: THUMBNAIL_SPACING,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  dateOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 2,
  },
  dateText: {
    color: "white",
    fontSize: 8,
    textAlign: "center",
  },
  noPhotosContainer: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotosText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  imageContainer: {
    width: width,
    height: width,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: width,
    height: width,
  },
  photoInfo: {
    position: "absolute",
    bottom: -80,
    left: 0,
    right: 0,
    padding: 16,
  },
  photoDate: {
    color: "white",
    fontSize: 14,
    marginBottom: 4,
  },
  photoNote: {
    color: "white",
    fontSize: 14,
    fontStyle: "italic",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default PhotoGallery;
