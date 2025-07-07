import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Componente per la ricerca per codice
const SearchByCode = ({ onSearch, isLoading }) => {
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState("");

  const validateCode = (code) => {
    // Verifica che il codice sia numerico e di 10 cifre
    const numericRegex = /^\d{10}$/;
    return numericRegex.test(code);
  };

  const handleSearch = () => {
    if (!trackingCode) {
      setError("Inserisci un codice di spedizione");
      return;
    }

    if (!validateCode(trackingCode)) {
      setError("Il codice deve essere di 10 cifre numeriche");
      return;
    }

    setError("");
    onSearch(trackingCode);
  };

  const handleChange = (text) => {
    // Accetta solo caratteri numerici
    const numericText = text.replace(/[^0-9]/g, "");
    setTrackingCode(numericText);

    // Reset errore quando l'utente modifica il campo
    if (error) setError("");
  };

  return (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>Cerca Spedizione</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Inserisci codice a 10 cifre"
          value={trackingCode}
          onChangeText={handleChange}
          keyboardType="numeric"
          maxLength={10}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Cerca</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// Componente modal per la ricerca
const SearchModal = ({ visible, onClose, onSearch }) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (code) => {
    setIsSearching(true);

    try {
      // Chiamata API senza autenticazione
      const response = await fetch(
        `https://tools.expressdeliverygroup.com/api/Spedizioni/spedizione-noauth/${code}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Controlla prima lo stato HTTP
      if (!response.ok) {
        // Status code non è 2xx
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Controlla se abbiamo dati validi
      if (data && data.id_spedizione) {
        console.log("Dati spedizione ricevuti:", data);
        onSearch(data);
      } else {
        Alert.alert(
          "Informazione",
          "Nessuna spedizione trovata con questo codice."
        );
      }
    } catch (error) {
      console.error("Errore nella ricerca:", error);
      Alert.alert(
        "Errore",
        error.message || "Impossibile completare la ricerca. Riprova più tardi."
      );
    } finally {
      setIsSearching(false);
      onClose();
    }
  };

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
            <Text style={styles.modalTitle}>Ricerca Spedizione</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <SearchByCode onSearch={handleSearch} isLoading={isSearching} />
        </View>
      </View>
    </Modal>
  );
};

// Stili
const styles = StyleSheet.create({
  searchContainer: {
    width: "100%",
    padding: 16,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#00AFFA",
    borderRadius: 4,
    padding: 10,
    marginLeft: 8,
    minWidth: 80,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 8,
  },
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
});

export default SearchModal;
