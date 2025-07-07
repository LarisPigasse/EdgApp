import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const QRScannerModal = ({ visible, onClose, onCodeScanned }) => {
  // Hook per i permessi della fotocamera
  const [permission, requestPermission] = useCameraPermissions();

  // Stato per la gestione dello scanner
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);

  // Animazione per la linea di scansione
  const scanLineAnimation = useRef(new Animated.Value(0)).current;

  // Funzione per animare la linea di scansione
  const animateScanLine = () => {
    scanLineAnimation.setValue(0);
    Animated.timing(scanLineAnimation, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    }).start(() => {
      if (scanning && !scanned) {
        animateScanLine();
      }
    });
  };

  // Funzione per attivare/disattivare la torcia
  const toggleTorch = () => {
    console.log("Attivazione torcia:", !torchEnabled);
    setTorchEnabled(!torchEnabled);
  };

  // Imposta lo stato di scanning quando il componente diventa visibile
  useEffect(() => {
    if (visible) {
      setScanning(true);
      setScanned(false);
      animateScanLine();
    } else {
      setScanning(false);
      // Assicurati che la torcia sia spenta quando chiudi la modal
      setTorchEnabled(false);
    }
  }, [visible]);

  // Funzione per la gestione della scansione del codice a barre
  const handleBarCodeScanned = (scanningResult) => {
    if (scanned || !scanning) return;

    const { type, data } = scanningResult;
    setScanned(true);
    setScanning(false);

    console.log(`Tipo di codice a barre: ${type}`);
    console.log(`Dati scansionati: ${data}`);

    // Controlla se il codice è un codice spedizione valido
    if (validateShipmentCode(data)) {
      onCodeScanned(data);
    } else {
      Alert.alert(
        "Codice non valido",
        "Il QR code scansionato non è un codice di spedizione valido. Riprova.",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
              setScanning(true);
            },
          },
        ]
      );
    }
  };

  // Funzione per validare il formato del codice spedizione
  const validateShipmentCode = (code) => {
    // Per ora consideriamo valido un codice numerico di 10 cifre
    // Modifica questa validazione in base alle tue esigenze specifiche
    const numericRegex = /^\d{10}$/;
    return numericRegex.test(code);
  };

  // Reset dello stato di scansione
  const handleResetScan = () => {
    setScanned(false);
    setScanning(true);
  };

  // Verifica se siamo in ambiente web
  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>La scansione QR code non è supportata in ambiente web.</Text>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Se i permessi stanno ancora caricando
  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator size="large" color="#00AFFA" />
            <Text style={{ marginTop: 20 }}>
              Verifica permessi fotocamera...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  // Se i permessi non sono stati concessi
  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.messageText}>
              Per utilizzare questa funzione, è necessario concedere i permessi
              per la fotocamera.
            </Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Concedi permessi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { marginTop: 10, backgroundColor: "#888" },
              ]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Annulla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          enableTorch={torchEnabled}
          flashMode="off"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scansiona QR Code</Text>
              <TouchableOpacity
                style={[
                  styles.flashButton,
                  torchEnabled ? styles.flashButtonActive : {},
                ]}
                onPress={toggleTorch}
              >
                <Ionicons
                  name={torchEnabled ? "flash" : "flash-off"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                {scanning && (
                  <Animated.View
                    style={[
                      styles.scanLine,
                      {
                        transform: [
                          {
                            translateY: scanLineAnimation.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, width * 0.7],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.instruction}>
                Inquadra il QR code della spedizione all'interno del riquadro
              </Text>

              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={handleResetScan}
                >
                  <Text style={styles.rescanButtonText}>
                    Scansiona di nuovo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 10,
    borderRadius: 50,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  flashButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  flashButtonActive: {
    backgroundColor: "rgba(255, 165, 0, 0.5)",
  },
  scanArea: {
    alignItems: "center",
    justifyContent: "center",
    height: width * 0.7, // Quadrato per la scansione
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: "#00AFFA",
    backgroundColor: "transparent",
    borderRadius: 10,
    overflow: "hidden",
  },
  scanLine: {
    height: 2,
    width: width * 0.7,
    backgroundColor: "#00AFFA",
    position: "absolute",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  instruction: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  rescanButton: {
    backgroundColor: "#00AFFA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  rescanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#00AFFA",
    minWidth: 150,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default QRScannerModal;
