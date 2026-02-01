import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View, Alert } from "react-native";
import { theme } from "../ui/theme";
import type { VisitEntry } from "../types/entry";
import { clearEntries, loadEntries } from "../storage/entries";

function ratingLabel(r: VisitEntry["rating"]) {
  if (r === "yes") return "🙂 Ja";
  if (r === "neutral") return "😐 Nøytral";
  return "🙁 Nei";
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function LogScreen() {
  const [entries, setEntries] = useState<VisitEntry[]>([]);

  const refresh = useCallback(async () => {
    const e = await loadEntries();
    setEntries(e);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const empty = useMemo(() => entries.length === 0, [entries.length]);

  const onClear = async () => {
    Alert.alert(
      "Tøm logg",
      "Dette sletter alle lokale oppføringer på denne enheten.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett alt",
          style: "destructive",
          onPress: async () => {
            await clearEntries();
            await refresh();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: theme.muted, flex: 1 }}>
          {entries.length} oppføringer
        </Text>
        <Pressable onPress={refresh} style={{ padding: 10 }}>
          <Text style={{ color: theme.accent, fontWeight: "800" }}>Oppdater</Text>
        </Pressable>
        <Pressable onPress={onClear} style={{ padding: 10 }}>
          <Text style={{ color: theme.danger, fontWeight: "800" }}>Tøm</Text>
        </Pressable>
      </View>

      {empty ? (
        <View style={{ paddingTop: 40 }}>
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 16 }}>
            Ingen oppføringer ennå
          </Text>
          <Text style={{ color: theme.muted, marginTop: 8 }}>
            Gå til “Fang”, ta et bilde og lagre første øyeblikk.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 12,
                backgroundColor: theme.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: item.photoUri }}
                style={{ width: "100%", height: 220 }}
                resizeMode="cover"
              />

              <View style={{ padding: 12 }}>
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {ratingLabel(item.rating)}
                </Text>

                <Text style={{ color: theme.muted, marginTop: 6 }}>
                  {prettyDate(item.createdAtIso)}
                </Text>

                {item.location ? (
                  <Text style={{ color: theme.muted, marginTop: 6 }}>
                    {item.location.lat.toFixed(5)}, {item.location.lng.toFixed(5)}
                  </Text>
                ) : (
                  <Text style={{ color: theme.muted, marginTop: 6 }}>
                    (Ingen GPS)
                  </Text>
                )}

                {item.comment ? (
                  <Text style={{ color: theme.text, marginTop: 10 }}>
                    {item.comment}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
