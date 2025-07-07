import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Lista degli stati predefiniti
const STATI_PREDEFINITI = [
  { id: 1, nome: "IN TRANSITO" },
  { id: 2, nome: "IN CONSEGNA" },
  { id: 3, nome: "CONSEGNATA" },
  { id: 4, nome: "ARRIVO HUB" },
  { id: 5, nome: "PARTENZA HUB" },
  { id: 6, nome: "RITIRATA" },
  { id: 7, nome: "IN GIACENZA" },
  { id: 8, nome: "MANCATA CONSEGNA" },
  { id: 9, nome: "RITORNO AL MITTENTE" },
];

// Componente per la selezione del nuovo stato
const StatusModal = ({
  visible,
  onClose,
  onSelectStatus,
  currentStatus,
  isLoading,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Filtra lo stato corrente dalla lista
  const statiDisponibili = STATI_PREDEFINITI.filter(
    (stato) => stato.nome !== currentStatus
  );

  // Gestisce la selezione di uno stato
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowNoteInput(true);
  };

  // Gestisce il salvataggio dello stato e delle note
  const handleSave = () => {
    if (!selectedStatus) return;

    onSelectStatus(selectedStatus, additionalInfo);

    // Reset dello stato
    setSelectedStatus(null);
    setAdditionalInfo("");
    setShowNoteInput(false);
  };

  // Renderizza ogni item della lista
  const renderStatusItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.statusItem,
        selectedStatus === item.nome && styles.statusItemSelected,
      ]}
      onPress={() => handleStatusSelect(item.nome)}
    >
      <Text
        style={[
          styles.statusItemText,
          selectedStatus === item.nome && styles.statusItemTextSelected,
        ]}
      >
        {item.nome}
      </Text>
      <Ionicons
        name={
          selectedStatus === item.nome ? "checkmark-circle" : "chevron-forward"
        }
        size={20}
        color={selectedStatus === item.nome ? "#2ecc71" : "#999"}
      />
    </TouchableOpacity>
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
          {!showNoteInput ? (
            // Vista selezione stato
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleziona Nuovo Stato</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.currentStatusContainer}>
                <Text style={styles.currentStatusLabel}>Stato attuale:</Text>
                <Text style={styles.currentStatusValue}>{currentStatus}</Text>
              </View>

              <FlatList
                data={statiDisponibili}
                renderItem={renderStatusItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.statusList}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                  <Text style={{ padding: 20, textAlign: "center" }}>
                    Nessuno stato disponibile
                  </Text>
                }
              />
            </>
          ) : (
            // Vista inserimento note
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Aggiungi Note (opzionale)</Text>
                <TouchableOpacity
                  onPress={() => setShowNoteInput(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>
                  Nuovo stato:{" "}
                  <Text style={styles.selectedStatus}>{selectedStatus}</Text>
                </Text>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Inserisci eventuali note aggiuntive..."
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salva</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
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
    height: 400,
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
  currentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  currentStatusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginRight: 8,
  },
  currentStatusValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00AFFA",
  },
  statusList: {
    flex: 1,
    minHeight: 200,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  statusItemSelected: {
    backgroundColor: "#f0f9ff",
  },
  statusItemText: {
    fontSize: 16,
    color: "#333",
  },
  statusItemTextSelected: {
    fontWeight: "bold",
    color: "#00AFFA",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },
  noteContainer: {
    flex: 1,
    padding: 16,
  },
  noteLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },
  selectedStatus: {
    fontWeight: "bold",
    color: "#00AFFA",
  },
  noteInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#00AFFA",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StatusModal;
