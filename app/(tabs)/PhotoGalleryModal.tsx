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
  FlatList,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const THUMBNAIL_SIZE = 100;
const THUMBNAIL_SPACING = 12;

const PhotoGalleryModal = ({ visible, onClose, photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState({});

  if (!photos || photos.length === 0) {
    return null;
  }

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleCloseGallery = () => {
    setSelectedPhoto(null);
    onClose();
  };

  const handleImageLoad = (photoId) => {
    setLoading((prev) => ({ ...prev, [photoId]: false }));
  };

  const handleImageLoadStart = (photoId) => {
    setLoading((prev) => ({ ...prev, [photoId]: true }));
  };

  const handleViewLocation = (photo) => {
    const { latitudine, longitudine } = photo;

    if (
      !latitudine ||
      !longitudine ||
      latitudine === "" ||
      longitudine === ""
    ) {
      Alert.alert("Errore", "Coordinate non disponibili");
      return;
    }

    // Crea l'URL per Google Maps
    const url = `https://www.google.com/maps/search/?api=1&query=${latitudine},${longitudine}`;

    // Verifica se il dispositivo può aprire l'URL e procedi
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback per dispositivi che non supportano l'URL di Google Maps
          const geoUrl = `geo:${latitudine},${longitudine}`;
          return Linking.openURL(geoUrl).catch(() => {
            throw new Error("Nessuna app di mappe disponibile");
          });
        }
      })
      .catch((error) => {
        console.error("Errore nell'apertura della mappa:", error);
        Alert.alert(
          "Informazione",
          `Non è stato possibile aprire la mappa. Coordinate: ${latitudine}, ${longitudine}`
        );
      });
  };

  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
    >
      <View style={styles.thumbnailContainer}>
        {loading[item.id] && (
          <ActivityIndicator
            style={styles.loader}
            size="small"
            color="#00AFFA"
          />
        )}
        <Image
          source={{ uri: item.fullPath }}
          style={styles.thumbnailImage}
          onLoadStart={() => handleImageLoadStart(item.id)}
          onLoad={() => handleImageLoad(item.id)}
          resizeMode="cover"
        />
      </View>
      <View style={styles.photoInfo}>
        <View style={styles.photoInfoHeader}>
          <Text style={styles.photoDate}>
            {new Date(
              item.data_creazione || item.data_scatto
            ).toLocaleDateString()}
          </Text>
          {item.latitudine && item.longitudine && (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => handleViewLocation(item)}
            >
              <Ionicons name="location" size={16} color="#00AFFA" />
              <Text style={styles.locationText}>Mappa</Text>
            </TouchableOpacity>
          )}
        </View>
        {item.operatore && (
          <Text style={styles.photoOperator}>Operatore: {item.operatore}</Text>
        )}
        {item.nota && (
          <Text style={styles.photoNote} numberOfLines={2}>
            {item.nota}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Modal principale per la galleria
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCloseGallery}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Galleria Foto ({photos.length})
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseGallery}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.photosList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nessuna foto disponibile</Text>
            }
          />
        </View>
      </View>

      {/* Modal secondaria per visualizzazione a schermo intero */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.fullScreenCloseButton}
            onPress={handleCloseModal}
          >
            <Ionicons name="close-circle" size={36} color="white" />
          </TouchableOpacity>

          {selectedPhoto && (
            <View style={styles.fullScreenImageContainer}>
              <Image
                source={{ uri: selectedPhoto.fullPath }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              <View style={styles.fullScreenPhotoInfo}>
                <Text style={styles.fullScreenPhotoDate}>
                  Scattata il:{" "}
                  {new Date(
                    selectedPhoto.data_creazione || selectedPhoto.data_scatto
                  ).toLocaleString()}
                </Text>
                {selectedPhoto.operatore && (
                  <Text style={styles.fullScreenPhotoOperator}>
                    Operatore: {selectedPhoto.operatore}
                  </Text>
                )}
                {selectedPhoto.nota && (
                  <Text style={styles.fullScreenPhotoNote}>
                    Nota: {selectedPhoto.nota}
                  </Text>
                )}
                {selectedPhoto.latitudine && selectedPhoto.longitudine && (
                  <TouchableOpacity
                    style={styles.fullScreenLocationButton}
                    onPress={() => handleViewLocation(selectedPhoto)}
                  >
                    <Ionicons name="location" size={20} color="white" />
                    <Text style={styles.fullScreenLocationText}>
                      Visualizza posizione sulla mappa
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "90%",
    height: "80%",
    borderRadius: 12,
    overflow: "hidden",
    maxWidth: 600,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 6,
  },
  photosList: {
    padding: 16,
  },
  photoItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  photoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  photoInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  photoDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  photoOperator: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  photoNote: {
    fontSize: 12,
    color: "#777",
    fontStyle: "italic",
    marginTop: 4,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: "#00AFFA",
    marginLeft: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    padding: 20,
    fontStyle: "italic",
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },

  // Stili per modal a schermo intero
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullScreenImageContainer: {
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width * 0.9,
    height: height * 0.6,
  },
  fullScreenPhotoInfo: {
    position: "absolute",
    bottom: -100,
    left: 0,
    right: 0,
    padding: 20,
  },
  fullScreenPhotoDate: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  fullScreenPhotoOperator: {
    color: "white",
    fontSize: 14,
    marginBottom: 6,
  },
  fullScreenPhotoNote: {
    color: "white",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 10,
  },
  fullScreenLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 175, 250, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  fullScreenLocationText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
  },
});

export default PhotoGalleryModal;
