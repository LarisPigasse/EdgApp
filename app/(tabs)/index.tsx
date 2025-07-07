import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchModal from "./SearchModal";
import StatusModal from "./StatusModal";
import TrackingModal from "./TrackingModal";
import CameraModal from "./CameraModal";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import PhotoGallery from "./PhotoGallery";
import PhotoGalleryModal from "./PhotoGalleryModal";
import QRScannerModal from "./QRScannerModal";

// Header Component
const Header = ({ isLoggedIn, onLoginLogout, userName }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>EDG</Text>
      <TouchableOpacity style={styles.loginButton} onPress={onLoginLogout}>
        <Text style={styles.loginButtonText}>
          {isLoggedIn ? "Logout" : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert("Errore", "Inserisci email e password");
      return;
    }
    onLogin(email, password);
  };

  return (
    <View style={styles.loginForm}>
      <Text style={styles.loginFormTitle}>Accesso Operatore</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Inserisci email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Inserisci password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Accedi</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Content Area Component
const ContentArea = ({
  isLoggedIn,
  showLoginForm,
  userInfo,
  isLoading,
  onLogin,
  shipmentData,
  onCloseShipment,
  onChangeStatus,
  onViewTracking,
  shipmentPhotos,
  onViewPhotos,
}) => {
  return (
    <View style={styles.contentArea}>
      <View style={styles.colorBackground} />

      {/* Header con info utente (visibile solo quando loggato) */}
      {isLoggedIn && userInfo && (
        <View style={styles.userHeader}>
          <Text style={styles.userHeaderName}>{userInfo.account}</Text>
          <Text style={styles.userHeaderType}>{userInfo.tipo_account}</Text>
        </View>
      )}

      <ScrollView style={styles.scrollContent}>
        <View style={styles.contentContainer}>
          {/* Titolo visibile solo quando non loggato */}
          {!isLoggedIn && (
            <Text style={styles.contentTitle}>EDG EXPRESS TRACKING</Text>
          )}

          {!isLoggedIn && !showLoginForm && (
            <Text style={styles.loginMessage}>
              Nessun operatore connesso. Effettua il login
            </Text>
          )}

          {showLoginForm && !isLoggedIn && (
            <LoginForm onLogin={onLogin} isLoading={isLoading} />
          )}

          {/* Il contenuto principale quando l'utente è loggato */}
          {isLoggedIn && userInfo && !shipmentData && (
            <View style={styles.mainContent}>
              <Text style={styles.instructionText}>
                Seleziona una spedizione tramite:
              </Text>
              <View style={styles.optionsList}>
                <Text style={styles.optionItem}>- QR Code</Text>
                <Text style={styles.optionItem}>- Cerca per codice</Text>
              </View>
            </View>
          )}

          {/* Visualizzazione dei dati della spedizione se disponibili */}
          {isLoggedIn && shipmentData && (
            <View style={styles.shipmentDirectContainer}>
              <Text style={styles.shipmentDirectTitle}>
                Spedizione: {shipmentData.id_spedizione || "N/A"}
              </Text>

              <View style={styles.shipmentDetailsGrid}>
                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Stato:</Text>
                  <Text
                    style={[
                      styles.shipmentDetailValue,
                      styles.shipmentStatus,
                      shipmentData.stato &&
                        shipmentData.stato.toLowerCase() === "consegnato" &&
                        styles.statusDelivered,
                      shipmentData.stato &&
                        shipmentData.stato.toLowerCase() === "in transito" &&
                        styles.statusInTransit,
                    ]}
                  >
                    {shipmentData.stato || "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Data sped.:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.data_spedizione
                      ? new Date(
                          shipmentData.data_spedizione
                        ).toLocaleDateString("it-IT")
                      : "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Cliente:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.cliente || "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Destinatario:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.destinatario || "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Indirizzo:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.indirizzo || "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Città:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {`${shipmentData.citta || "N/A"} ${
                      shipmentData.cap ? `- ${shipmentData.cap}` : ""
                    }`}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Email:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.email || "N/A"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Note:</Text>
                  <Text style={styles.shipmentDetailValue}>
                    {shipmentData.note || "Nessuna nota"}
                  </Text>
                </View>

                <View style={styles.shipmentDetailRow}>
                  <Text style={styles.shipmentDetailLabel}>Foto:</Text>

                  {shipmentPhotos && shipmentPhotos.length > 0 && (
                    <TouchableOpacity
                      style={styles.viewPhotosButton}
                      onPress={() => onViewPhotos()}
                    >
                      <Text style={styles.viewPhotosButtonText}>
                        Visualizza ({shipmentPhotos.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Pulsante per visualizzare le foto, visibile solo se ci sono foto */}

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.trackingButton}
                  onPress={() => onViewTracking(shipmentData)}
                >
                  <Text style={styles.buttonText}>Tracking</Text>
                </TouchableOpacity>

                {/* Pulsante Nuovo Stato - sempre visibile la disabilitato se lo stato è CONSEGNATA */}
                <TouchableOpacity
                  style={[
                    styles.newStatusButton,
                    shipmentData.stato &&
                      shipmentData.stato.toUpperCase() === "CONSEGNATA" &&
                      styles.newStatusButtonDisabled,
                  ]}
                  onPress={() => onChangeStatus(shipmentData.id_spedizione)}
                  disabled={
                    shipmentData.stato &&
                    shipmentData.stato.toUpperCase() === "CONSEGNATA"
                  }
                >
                  <Text
                    style={[
                      styles.buttonText,
                      shipmentData.stato &&
                        shipmentData.stato.toUpperCase() === "CONSEGNATA" &&
                        styles.buttonTextDisabled,
                    ]}
                  >
                    Nuovo Stato
                  </Text>
                </TouchableOpacity>

                {/* Pulsante Chiudi - sempre visibile */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    shipmentData.stato &&
                    shipmentData.stato.toUpperCase() !== "CONSEGNATA"
                      ? styles.closeButtonHalfWidth
                      : styles.closeButtonFullWidth,
                  ]}
                  onPress={onCloseShipment}
                >
                  <Text style={styles.buttonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
  {
    /* PhotoGalleryModal */
  }
  <PhotoGalleryModal
    visible={showPhotoGalleryModal}
    onClose={() => setShowPhotoGalleryModal(false)}
    photos={shipmentPhotos}
  />;
};

// Footer Button Component
const FooterButton = ({ icon, label, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={styles.footerButton}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={24}
        color={disabled ? "#cccccc" : "#FEBF01"}
      />
      <Text
        style={[
          styles.footerButtonText,
          disabled && styles.footerButtonTextDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Footer Component
const Footer = ({
  isLoggedIn,
  onQRScan,
  onManualSearch,
  onTakePhoto,
  shipmentData,
}) => {
  const isSearchDisabled = !isLoggedIn || !!shipmentData;

  return (
    <View style={styles.footer}>
      <FooterButton
        icon="qr-code-outline"
        label="QR Code"
        onPress={onQRScan}
        disabled={isSearchDisabled} // Disabilita se non loggato o se spedizione visualizzata
      />
      <FooterButton
        icon="search-outline"
        label="Cerca"
        onPress={onManualSearch}
        disabled={isSearchDisabled} // Disabilita se non loggato o se spedizione visualizzata
      />
      <FooterButton
        icon="camera-outline"
        label="Foto"
        onPress={onTakePhoto}
        disabled={!isLoggedIn}
      />
    </View>
  );
};

// Aggiungi questa funzione in index.tsx
// Prima della funzione App o come funzione helper esterna

const fetchShipmentPhotos = async (shipmentId, userToken) => {
  try {
    // Chiamata all'API per ottenere le foto associate alla spedizione
    console.log("Richiesta foto per shipmentId:", shipmentId);
    const response = await fetch(
      `https://tools.expressdeliverygroup.com/api/spedizioni/files/${shipmentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Risposta API foto:", data);

    if (Array.isArray(data)) {
      // Aggiungi il path base a ciascun file
      return data.map((file) => ({
        ...file,
        id: file.id_file, // Mappiamo id_file a id come richiesto da PhotoGallery
        data_creazione: file.data_scatto, // Mappiamo data_scatto a data_creazione
        fullPath: `https://tools.expressdeliverygroup.com/backend/files/tracking/${file.nome_file}`,
      }));
    }

    // Formato alternativo { ok: true, files: [...] }
    if (data && data.ok && data.files) {
      return data.files.map((file) => ({
        ...file,
        fullPath: `https://tools.expressdeliverygroup.com/backend/files/tracking/${file.nome_file}`,
      }));
    }

    // Se arriviamo qui, ma non abbiamo dati validi, restituiamo un array vuoto
    console.log("Formato dati non riconosciuto, restituisco array vuoto");
    return [];
  } catch (error) {
    console.error("Errore nel recupero delle foto:", error);
    return [];
  }
};

// Main App Component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [shipmentData, setShipmentData] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [shipmentPhotos, setShipmentPhotos] = useState([]);
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);

  useEffect(() => {
    if (shipmentData && userInfo) {
      refreshShipmentPhotos();
    } else {
      setShipmentPhotos([]);
    }
  }, [shipmentData, userInfo]);

  const refreshShipmentPhotos = async () => {
    if (shipmentData && userInfo) {
      try {
        const photos = await fetchShipmentPhotos(
          shipmentData.id_spedizione,
          userInfo.token
        );
        setShipmentPhotos(photos);
        console.log("Foto caricate:", photos);
        console.log("Numero di foto:", photos.length);
      } catch (error) {
        console.error("Errore nel caricare le foto:", error);
        setShipmentPhotos([]);
      }
    } else {
      setShipmentPhotos([]);
    }
  };

  const handleViewTracking = (shipmentData) => {
    setSelectedShipment(shipmentData);
    setShowTrackingModal(true);
  };

  const handleChangeStatus = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setShowStatusModal(true);
  };

  const handleSelectStatus = async (newStatus, additionalInfo = "") => {
    if (!selectedShipmentId || !userInfo) return;

    console.log(
      `Modifica stato della spedizione in corso ${selectedShipmentId} a ${newStatus}`
    );

    try {
      setIsStatusLoading(true);

      // Otteniamo la data attuale in formato ISO
      const currentDate = new Date().toISOString();

      // Otteniamo le coordinate attuali
      let locationData = { coords: { latitude: "", longitude: "" } };
      let hasLocationPermission = false;

      try {
        // Richiedi i permessi di geolocalizzazione
        const { status } = await Location.requestForegroundPermissionsAsync();
        hasLocationPermission = status === "granted";

        if (hasLocationPermission) {
          // Ottieni la posizione attuale
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          locationData = location;
          console.log("Posizione ottenuta:", locationData.coords);
        } else {
          console.log("Permessi di localizzazione non concessi");
        }
      } catch (locError) {
        console.error("Errore nell'ottenere la posizione:", locError);
      }

      // Prepariamo i dati per l'API
      const trackingData = {
        id_spedizione: selectedShipmentId,
        data_tracking: currentDate,
        localita: "", // Potremmo implementare la geolocalizzazione in futuro
        info: additionalInfo, // Note aggiuntive opzionali
        evento: newStatus,
        operatore: userInfo.account, // Nome dell'operatore loggato
        latitudine: locationData.coords.latitude.toString(), // Conversione in stringa
        longitudine: locationData.coords.longitude.toString(), // Conversione in stringa
      };

      // Chiamata API per salvare il nuovo stato
      const response = await fetch(
        "https://tools.expressdeliverygroup.com/api/spedizioni/insert-tracking-da-operatore",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userInfo.token}`, // Assicurati che il token sia disponibile
          },
          body: JSON.stringify(trackingData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
      }

      // Risposta API con conferma
      const data = await response.json();

      if (data && data.ok) {
        // Aggiorniamo lo stato locale della spedizione
        if (shipmentData && shipmentData.id_spedizione === selectedShipmentId) {
          setShipmentData({
            ...shipmentData,
            stato: newStatus,
          });
        }

        // Mostriamo un messaggio di successo
        Alert.alert(
          "Successo",
          "Stato della spedizione aggiornato correttamente"
        );
      } else {
        throw new Error("Errore nell'aggiornamento dello stato");
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      Alert.alert(
        "Errore",
        `Impossibile aggiornare lo stato: ${
          error.message || "Si è verificato un errore"
        }`
      );
    } finally {
      setIsStatusLoading(false);
      setShowStatusModal(false);
    }
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      // Logout
      setIsLoggedIn(false);
      setUserInfo(null);
      setShipmentData(null);
      console.log("Utente disconnesso");
    } else {
      // Mostra form di login
      setShowLoginForm(true);
    }
  };

  const handleLogin = async (email, password) => {
    setIsLoginLoading(true);

    try {
      const response = await fetch(
        "https://tools.expressdeliverygroup.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.ok && data.utente) {
        // Login riuscito
        setUserInfo(data.utente);
        setIsLoggedIn(true);
        setShowLoginForm(false);
        console.log("Utente connesso:", data.utente.account);
      } else {
        // Login fallito
        Alert.alert("Errore", "Credenziali non valide. Riprova.");
      }
    } catch (error) {
      Alert.alert(
        "Errore",
        "Impossibile connettersi al server. Riprova più tardi."
      );
      console.error("Errore di login:", error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleQRScan = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Accesso richiesto",
        "Per utilizzare la scansione QR code, devi prima effettuare il login."
      );
      return;
    }

    if (shipmentData) {
      Alert.alert(
        "Spedizione già selezionata",
        "Chiudi prima la spedizione corrente per scansionarne un'altra."
      );
      return;
    }

    // Apri la modal di scansione QR
    setShowQRScannerModal(true);
  };

  // funzione per gestire il codice QR scansionato
  // Funzione migliorata per gestire il codice QR scansionato con migliore gestione degli errori
  const handleQRCodeScanned = async (shipmentCode) => {
    console.log("Codice spedizione scansionato:", shipmentCode);
    setShowQRScannerModal(false);

    // Mostra un indicatore di caricamento
    setIsLoading(true);

    try {
      // Chiamata API per recuperare i dati della spedizione
      const response = await fetch(
        `https://tools.expressdeliverygroup.com/api/Spedizioni/spedizione-noauth/${shipmentCode}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Leggi la risposta come testo per poterla esaminare prima di provare a parsarla come JSON
      const responseText = await response.text();

      // Prova a convertire la risposta in JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Errore nel parsing della risposta:", e);
        throw new Error("Il server ha restituito una risposta non valida.");
      }

      // Se la risposta non è un errore HTTP ma non contiene dati validi
      if (!response.ok) {
        if (data && data.message) {
          throw new Error(data.message);
        } else if (response.status === 404) {
          throw new Error(
            "Spedizione non trovata. Verifica il codice e riprova."
          );
        } else {
          throw new Error(`Errore del server: ${response.status}`);
        }
      }

      // Controlla se abbiamo dati validi
      if (data && data.id_spedizione) {
        console.log("Dati spedizione ricevuti:", data);
        setShipmentData(data);
        return;
      }

      // Se arriviamo qui, non abbiamo ricevuto un errore HTTP ma neanche dati validi
      throw new Error("Nessuna spedizione trovata con questo codice.");
    } catch (error) {
      console.error("Errore nella ricerca:", error);

      // Personalizza il messaggio di errore in base alla causa
      let errorMessage =
        "Impossibile completare la ricerca. Riprova più tardi.";

      if (
        error.message.includes("Spedizione non trovata") ||
        error.message.includes("Nessuna spedizione trovata")
      ) {
        errorMessage =
          "Nessuna spedizione trovata con questo codice. Verifica che il QR code sia corretto.";
      } else if (error.message.includes("server")) {
        errorMessage =
          "Problema di connessione al server. Verifica la tua connessione internet e riprova.";
      }

      Alert.alert("Ricerca spedizione", errorMessage, [
        {
          text: "OK",
          onPress: () => console.log("Errore riconosciuto"),
        },
        {
          text: "Scansiona di nuovo",
          onPress: () => setShowQRScannerModal(true),
          style: "default",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = () => {
    // Mostra il modale di ricerca
    setShowSearchModal(true);
  };

  const handleSearch = (shipmentData) => {
    console.log("Spedizione trovata:", shipmentData);
    setShipmentData(shipmentData);
  };

  const handleTakePhoto = () => {
    if (!shipmentData) {
      Alert.alert(
        "Avviso",
        "Devi prima selezionare una spedizione per allegare una foto."
      );
      return;
    }
    Camera.requestCameraPermissionsAsync()
      .then(({ status }) => {
        if (status === "granted") {
          // Solo se i permessi sono concessi, mostriamo la modale
          setShowCameraModal(true);
        } else {
          Alert.alert(
            "Permessi fotocamera",
            "I permessi per la fotocamera non sono stati concessi. Verifica le impostazioni del dispositivo."
          );
        }
      })
      .catch((error) => {
        console.error("Errore nell'accesso alla fotocamera:", error);
        Alert.alert(
          "Fotocamera non disponibile",
          "Non è stato possibile accedere alla fotocamera. Riprova più tardi."
        );
      });
  };

  const handleCameraPhotoTaken = (photoInfo) => {
    console.log("Foto allegata:", photoInfo);
    refreshShipmentPhotos();
  };

  const handleViewPhotos = () => {
    setShowPhotoGalleryModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        isLoggedIn={isLoggedIn}
        onLoginLogout={handleLoginLogout}
        userName={userInfo?.account}
      />
      <ContentArea
        isLoggedIn={isLoggedIn}
        showLoginForm={showLoginForm}
        userInfo={userInfo}
        isLoading={isLoginLoading}
        onLogin={handleLogin}
        shipmentData={shipmentData}
        onCloseShipment={() => setShipmentData(null)}
        onChangeStatus={handleChangeStatus}
        onViewTracking={handleViewTracking}
        shipmentPhotos={shipmentPhotos}
        onViewPhotos={handleViewPhotos}
      />
      <Footer
        isLoggedIn={isLoggedIn}
        onQRScan={handleQRScan}
        onManualSearch={handleManualSearch}
        onTakePhoto={handleTakePhoto}
        shipmentData={shipmentData} // Passa lo stato della spedizione al Footer
      />

      {/* Modal di ricerca */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
        // Rimosso userToken poiché non è più necessario
      />

      {shipmentData && (
        <StatusModal
          visible={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSelectStatus={handleSelectStatus}
          currentStatus={shipmentData.stato || ""}
          isLoading={isLoading} // Passa lo stato di caricamento
        />
      )}

      {/* Modal per visualizzare il tracking */}
      <TrackingModal
        visible={showTrackingModal}
        onClose={() => setShowTrackingModal(false)}
        shipmentData={selectedShipment}
      />

      {/* CameraModal */}
      {shipmentData && showCameraModal && (
        <CameraModal
          visible={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onPhotoTaken={handleCameraPhotoTaken}
          shipmentData={shipmentData}
          userToken={userInfo?.token}
          operatorName={userInfo?.account}
        />
      )}

      {/* PhotoGalleryModal */}
      <PhotoGalleryModal
        visible={showPhotoGalleryModal}
        onClose={() => setShowPhotoGalleryModal(false)}
        photos={shipmentPhotos}
      />

      {/* QRScannerModal */}
      <QRScannerModal
        visible={showQRScannerModal}
        onClose={() => setShowQRScannerModal(false)}
        onCodeScanned={handleQRCodeScanned}
      />
    </SafeAreaView>
  );
};
// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginTop: 64,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#00AFFA",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: "#FEBF01",
  },
  loginButtonText: {
    color: "black",
    fontWeight: "600",
  },
  contentArea: {
    flex: 1,
    position: "relative",
  },
  colorBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#E2E4E6",
  },
  scrollContent: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    padding: 16,
    flex: 1,
    alignItems: "center",
    minHeight: 300,
  },
  contentTitle: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  loginMessage: {
    fontSize: 16,
    color: "#777",
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#00AFFA",
  },
  footerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#FFF",
  },
  footerButtonTextDisabled: {
    color: "#cccccc",
  },
  loginForm: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
  },
  loginFormTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#00AFFA",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 2,
  },
  userHeaderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userHeaderType: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  mainContent: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 30,
  },
  instructionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  optionsList: {
    alignSelf: "flex-start",
    paddingLeft: 40,
  },
  optionItem: {
    fontSize: 15,
    color: "#555",
    marginBottom: 8,
    lineHeight: 22,
  },
  shipmentDirectContainer: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    padding: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  shipmentDirectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#00AFFA",
    paddingBottom: 8,
  },
  shipmentDetailsGrid: {
    width: "100%",
  },
  shipmentDetailRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  shipmentDetailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#777",
    width: "32%",
  },
  shipmentDetailValue: {
    fontSize: 15,
    color: "#222",
    flex: 1,
    fontWeight: "500",
  },
  shipmentStatus: {
    fontWeight: "bold",
    fontSize: 16,
  },
  statusDelivered: {
    color: "#2ecc71", // Verde per consegnato
  },
  statusInTransit: {
    color: "#3498db", // Blu per in transito
  },
  directCloseButton: {
    backgroundColor: "#00AFFA",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginHorizontal: 10,
    flexWrap: "wrap", // Per gestire meglio più pulsanti
  },
  trackingButton: {
    backgroundColor: "#00AFFA", // Blu come l'header
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newStatusButton: {
    backgroundColor: "#FEBF01", // Giallo come le icone
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButton: {
    backgroundColor: "#DD0000",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 8,
  },
  closeButtonWithButtons: {
    flex: 1,
  },
  closeButtonWithTracking: {
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  newStatusButtonDisabled: {
    backgroundColor: "#AAAAAA", // Versione grigia del giallo originale per indicare che il pulsante è disabilitato
    opacity: 0.7,
  },
  buttonTextDisabled: {
    color: "rgba(255, 255, 255, 0.6)", // Testo bianco con opacità ridotta
  },
  viewPhotosButton: {
    backgroundColor: "#555",
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 0,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  viewPhotosButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 8,
  },
});

export default App;
