import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import PrimaryButton from "../components/PrimaryButton";
import SegmentedRating from "../components/SegmentedRating";
import { theme } from "../ui/theme";
import type { Rating, VisitEntry } from "../types/entry";
import { addEntry } from "../storage/entries";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CaptureScreen() {
  const camRef = useRef<CameraView>(null);
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [locGranted, setLocGranted] = useState<boolean>(false);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState<string>("");

  const canSave = useMemo(() => !!photoUri && !!rating, [photoUri, rating]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocGranted(status === "granted");
      } catch {
        setLocGranted(false);
      }
    })();
  }, []);

  const ensureCamera = async () => {
    if (camPerm?.granted) return true;
    const res = await requestCamPerm();
    return res.granted;
  };

  const onTakePhoto = async () => {
    const ok = await ensureCamera();
    if (!ok) {
      Alert.alert("Kamera", "Du må gi kameratilgang for å ta bilde.");
      return;
    }

    try {
      const cam = camRef.current;
      if (!cam) return;

      const photo = await cam.takePictureAsync({
        quality: 0.85,
      });

      setPhotoUri(photo.uri);
    } catch {
      Alert.alert("Feil", "Kunne ikke ta bilde.");
    }
  };

  const onSave = async () => {
    if (!photoUri || !rating) return;

    let loc:
      | { lat: number; lng: number; accuracyM?: number }
      | undefined = undefined;

    if (locGranted) {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? undefined,
        };
      } catch {
        // ok: save without location if it fails
      }
    }

    const entry: VisitEntry = {
      id: makeId(),
      createdAtIso: new Date().toISOString(),
      photoUri,
      rating,
      comment: comment.trim() ? comment.trim() : undefined,
      location: loc,
    };

    try {
      await addEntry(entry);
      setPhotoUri(null);
      setRating(null);
      setComment("");
      Alert.alert("Lagret", "Opplevelsen er lagret i loggen din.");
    } catch {
      Alert.alert("Feil", "Kunne ikke lagre opplevelsen.");
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: "hidden",
        }}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: "100%", height: 360 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ height: 360 }}>
            <CameraView
              ref={camRef}
              style={{ flex: 1 }}
              facing="back"
            />
          </View>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <PrimaryButton
          title={photoUri ? "Ta nytt bilde" : "Ta bilde"}
          onPress={onTakePhoto}
        />
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>
          Likte jeg dette?
        </Text>
        <SegmentedRating value={rating} onChange={setRating} />
      </View>

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>
          Valgfri kommentar (1–2 linjer)
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Skriv kort..."
          placeholderTextColor={theme.muted}
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: theme.text,
          }}
          maxLength={140}
          multiline
        />
      </View>

      <View style={{ marginTop: 14 }}>
        <PrimaryButton title="Lagre øyeblikk" onPress={onSave} disabled={!canSave} />
        <Text style={{ color: theme.muted, marginTop: 8 }}>
          Tid lagres alltid. GPS lagres hvis tillatt.
        </Text>
      </View>
    </View>
  );
}
