import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  CameraView,
  CameraType,
  FlashMode,
  useCameraPermissions,
} from "expo-camera";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Costanti per la dimensione e qualità delle immagini
const MAX_IMAGE_WIDTH = 1024;
const JPEG_QUALITY = 50; // Valore tra 0-100, dove 100 è la massima qualità

const CameraModal = ({
  visible,
  onClose,
  onPhotoTaken,
  shipmentData,
  userToken,
  operatorName,
}) => {
  // Hook per i permessi della fotocamera
  const [permission, requestPermission] = useCameraPermissions();

  // Stati della fotocamera
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);

  // Funzione per scattare la foto
  const takePhoto = async () => {
    if (!cameraRef.current) {
      Alert.alert("Errore", "Fotocamera non inizializzata.");
      return;
    }

    setIsTakingPhoto(true);

    try {
      console.log("Tentativo di scattare foto");
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      console.log("Foto scattata con successo");
      setPhoto(photo);
    } catch (error) {
      console.error("Errore nello scatto della foto:", error);
      Alert.alert("Errore", "Impossibile scattare la foto. Riprova.");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  // Funzione per ottenere la posizione attuale
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permesso di posizione non concesso");
        return { latitude: "", longitude: "" };
      }

      console.log("Permesso di posizione concesso, ottengo posizione...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log("Posizione ottenuta:", location.coords);
      return {
        latitude: String(location.coords.latitude), // Assicurati di convertire in stringa
        longitude: String(location.coords.longitude), // Assicurati di convertire in stringa
      };
    } catch (error) {
      console.error("Errore nell'ottenere la posizione:", error);
      // In caso di errore, restituisci comunque un oggetto con proprietà vuote
      // così da non causare errori quando si accede a position.latitude
      return { latitude: "", longitude: "" };
    }
  };

  // Funzione per caricare la foto

  const uploadPhoto = async () => {
    if (!photo || !shipmentData || !userToken) {
      Alert.alert("Errore", "Impossibile caricare la foto. Dati mancanti.");
      return;
    }

    setIsUploading(true);

    try {
      // Ottieni la posizione corrente
      const position = await getCurrentLocation();
      console.log("Posizione per la foto:", position);

      console.log("Inizio processo di upload...");
      console.log("ID Spedizione:", shipmentData.id_spedizione);

      // Step 1: Ridimensiona e comprimi l'immagine
      console.log("Ridimensionamento immagine...");
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: MAX_IMAGE_WIDTH } }], // Solo larghezza per mantenere proporzioni
        {
          compress: JPEG_QUALITY / 100,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Step 2: Converti l'immagine processata in base64
      console.log("Conversione in base64...");
      const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileSizeKB = base64.length / 1024;
      console.log(`Dimensione immagine compressa: ${fileSizeKB.toFixed(2)} KB`);

      // Prepara i dati per l'API
      const apiData = {
        id_spedizione: shipmentData.id_spedizione,
        immagine: base64,
        formato: "image/jpeg",
        nota: "Foto scattata dall'app mobile",
        operatore: operatorName || "Utente App", // Aggiungi il nome dell'operatore
        latitudine: position.latitude, // Aggiungi la latitudine
        longitudine: position.longitude, // Aggiungi la longitudine
      };

      // Verifica la struttura dei dati (senza stampare l'immagine base64 completa)
      console.log("Dati API pronti per l'invio:", {
        id_spedizione: apiData.id_spedizione,
        formato: apiData.formato,
        nota: apiData.nota,
        operatore: apiData.operatore,
        latitudine: apiData.latitudine,
        longitudine: apiData.longitudine,
        token: userToken ? "Presente" : "Mancante",
        imageSizeKB: fileSizeKB.toFixed(2),
      });

      // Chiama l'API per caricare l'immagine
      console.log("Invio richiesta API...");
      const response = await fetch(
        "https://tools.expressdeliverygroup.com/api/spedizioni/upload-file",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(apiData),
        }
      );

      console.log(JSON.stringify(apiData));
      console.log("Risposta ricevuta, stato:", response.status);

      // Log della risposta grezza per debug
      const responseText = await response.text();
      console.log("Risposta grezza:", responseText);

      // Parsing JSON della risposta
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Errore nel parsing della risposta JSON:", e);
        throw new Error("La risposta del server non è in formato JSON valido");
      }

      if (result.ok) {
        console.log("Foto caricata correttamente");
        Alert.alert("Successo", "Foto caricata correttamente");

        // Passa le informazioni complete del file al callback
        if (onPhotoTaken && result.file) {
          // Aggiungi il percorso completo all'oggetto file
          const fileWithPath = {
            ...result.file,
            fullPath: `https://tools.expressdeliverygroup.com/backend/files/tracking/${result.file.nome_file}`,
            operatore: operatorName,
            latitudine: position.latitude,
            longitudine: position.longitude,
          };
          onPhotoTaken(fileWithPath);
        }

        onClose();
      } else {
        throw new Error(result.message || "Errore nel caricamento della foto");
      }
    } catch (error) {
      console.error("Errore nell'upload:", error);
      Alert.alert(
        "Errore di upload",
        `Impossibile caricare la foto: ${
          error.message || "Errore sconosciuto"
        }.\nControllare la connessione di rete e riprovare.`
      );
    } finally {
      setIsUploading(false);
    }
  };
  // Funzione per ripetere la foto
  const retakePhoto = () => {
    setPhoto(null);
  };

  // Funzione per cambiare la fotocamera (frontale/posteriore)
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Funzione per cambiare il flash
  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  };

  // Verifica se siamo in ambiente web
  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>La fotocamera non è supportata in ambiente web.</Text>
            <Text> </Text>
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {!photo ? (
          // Modalità fotocamera
          <CameraView
            style={styles.camera}
            facing={facing}
            flashMode={flash}
            ref={cameraRef}
            onMountError={(error) => {
              console.error("Errore nel montaggio della camera:", error);
              Alert.alert(
                "Errore",
                "Impossibile inizializzare la fotocamera. Riprova."
              );
              onClose();
            }}
          >
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flash === "on" ? "flash" : "flash-off"}
                  size={30}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={30} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePhoto}
                disabled={isTakingPhoto}
              >
                {isTakingPhoto ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          // Modalità anteprima
          <View style={styles.previewContainer}>
            <Image source={{ uri: photo.uri }} style={styles.preview} />

            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={retakePhoto}
              >
                <Ionicons name="refresh" size={24} color="white" />
                <Text style={styles.previewButtonText}>Ripeti</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.previewButton}
                onPress={uploadPhoto}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={24} color="white" />
                    <Text style={styles.previewButtonText}>Invia</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
  },
  controlButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomControls: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  previewButton: {
    alignItems: "center",
    padding: 10,
  },
  previewButtonText: {
    color: "white",
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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

export default CameraModal;
