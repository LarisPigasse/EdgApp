import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Componente per la visualizzazione del tracking
const TrackingModal = ({ visible, onClose, shipmentData }) => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && shipmentData) {
      fetchTrackingData(shipmentData);
    }
  }, [visible, shipmentData]);

  const fetchTrackingData = async (shipmentData) => {
    setLoading(true);
    setError(null);

    try {
      if (!shipmentData || !shipmentData.discriminante) {
        throw new Error("Codice di tracking non disponibile");
      }

      const discriminante = shipmentData.discriminante;
      // Qui dovrai sostituire con l'URL corretto della tua API
      const response = await fetch(
        `https://tools.expressdeliverygroup.com/api/Spedizioni/tracking-noauth/${discriminante}`
      );

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Verifica se i dati hanno la struttura attesa
      if (Array.isArray(data)) {
        // Ordina i dati per data (dal più recente al più vecchio)
        const sortedData = [...data].sort(
          (a, b) =>
            new Date(b.data_tracking || b.data_stato || 0) -
            new Date(a.data_tracking || a.data_stato || 0)
        );

        setTrackingData(sortedData);
      } else if (data && data.tracking && Array.isArray(data.tracking)) {
        // Caso alternativo: se i dati sono contenuti in una proprietà "tracking"
        const sortedData = [...data.tracking].sort(
          (a, b) =>
            new Date(b.data_tracking || b.data_stato || 0) -
            new Date(a.data_tracking || a.data_stato || 0)
        );

        setTrackingData(sortedData);
      } else {
        // Se la struttura non è quella attesa ma c'è un messaggio di successo
        if (data && data.ok) {
          setTrackingData([]);
        } else {
          throw new Error("Struttura dati non valida");
        }
      }
    } catch (err) {
      console.error("Errore nel caricamento del tracking:", err);
      setError("Impossibile caricare i dati di tracking. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLocation = (item) => {
    const { latitudine, longitudine } = item;

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

  // Renderizza ogni evento di tracking
  const renderTrackingItem = ({ item, index }) => (
    <View
      style={[styles.trackingItem, index === 0 && styles.trackingItemFirst]}
    >
      <View style={styles.trackingIconContainer}>
        <View style={styles.trackingIcon}>
          <Ionicons
            name={index === 0 ? "checkmark-circle" : "ellipse"}
            size={index === 0 ? 24 : 18}
            color={index === 0 ? "#2ecc71" : "#3498db"}
          />
        </View>
        {index !== trackingData.length - 1 && (
          <View style={styles.trackingLine} />
        )}
      </View>

      <View style={styles.trackingContent}>
        <View style={styles.trackingStatusRow}>
          <Text style={styles.trackingStatus}>
            {item.evento || item.stato || "Stato aggiornato"}
          </Text>

          {/* Icona di posizione se ci sono coordinate */}
          {item.latitudine &&
            item.longitudine &&
            item.latitudine !== "" &&
            item.longitudine !== "" && (
              <TouchableOpacity
                style={styles.locationIcon}
                onPress={() => handleViewLocation(item)}
              >
                <Ionicons name="location" size={18} color="#3498db" />
              </TouchableOpacity>
            )}
        </View>

        <Text style={styles.trackingDate}>
          {new Date(
            item.data_tracking || item.data_stato || new Date()
          ).toLocaleString("it-IT")}
        </Text>

        {(item.info || item.note) && (
          <Text style={styles.trackingNotes}>{item.info || item.note}</Text>
        )}

        {item.operatore && (
          <Text style={styles.trackingOperator}>
            Operatore: {item.operatore}
          </Text>
        )}

        {item.localita && item.localita !== "" && (
          <Text style={styles.trackingLocation}>Località: {item.localita}</Text>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Storico Tracking</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.shipmentIdContainer}>
            <Text style={styles.shipmentIdLabel}>Spedizione:</Text>
            <Text style={styles.shipmentIdValue}>
              {shipmentData ? shipmentData.id_spedizione : "N/A"}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00AFFA" />
              <Text style={styles.loadingText}>Caricamento tracking...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={40} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : trackingData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="information-circle" size={40} color="#3498db" />
              <Text style={styles.emptyText}>
                Nessun dato di tracking disponibile
              </Text>
            </View>
          ) : (
            <FlatList
              data={trackingData}
              renderItem={renderTrackingItem}
              keyExtractor={(item, index) => `tracking-${index}`}
              style={styles.trackingList}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// Stili
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 500,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    height: 500, // Altezza fissa per garantire che la lista sia visibile
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
    padding: 4,
  },
  shipmentIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  shipmentIdLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginRight: 8,
  },
  shipmentIdValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00AFFA",
  },
  trackingList: {
    flex: 1,
  },
  trackingItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  trackingItemFirst: {
    // Stile per l'elemento più recente
  },
  trackingIconContainer: {
    width: 30,
    alignItems: "center",
  },
  trackingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  trackingLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#eee",
    marginTop: 4,
    marginBottom: 4,
    alignSelf: "center",
  },
  trackingContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  trackingDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  trackingNotes: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    fontStyle: "italic",
    lineHeight: 18,
  },
  trackingOperator: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    fontWeight: "500",
  },
  trackingItemFirst: {
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#3498db",
    textAlign: "center",
  },
  trackingLocation: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    fontStyle: "italic",
  },

  trackingStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locationIcon: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
  },
});

export default TrackingModal;
