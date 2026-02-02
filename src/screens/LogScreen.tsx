import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View, Alert, Modal } from "react-native";
import { theme } from "../ui/theme";
import type { ProfileId, VisitEntry } from "../types/entry";
import { loadEntries } from "../storage/entries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n/i18n";
import { CATEGORIES, normalizeCategoryId, type CategoryId } from "../constants/categories";

const KEY = "revisit.entries.v1";
type Stored = { entries: VisitEntry[] };

async function deleteOne(entryId: string) {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return;

  let parsed: Stored | null = null;
  try {
    parsed = JSON.parse(raw) as Stored;
  } catch {
    parsed = null;
  }
  if (!parsed || !Array.isArray(parsed.entries)) return;

  const next = parsed.entries.filter((e) => e.id !== entryId);
  await AsyncStorage.setItem(KEY, JSON.stringify({ entries: next }));
}

function ratingLabel(r: VisitEntry["rating"]) {
  if (r === "yes") return t("log.rating.yes");
  if (r === "neutral") return t("log.rating.neutral");
  return t("log.rating.no");
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function categoryDef(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export default function LogScreen({
  isActive,
  activeProfile,
}: {
  isActive: boolean;
  activeProfile: ProfileId;
}) {
  const [entries, setEntries] = useState<VisitEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all");

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const e = await loadEntries(activeProfile);
      setEntries(e);
    } finally {
      setBusy(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (isActive) refresh();
  }, [isActive, refresh]);

  useEffect(() => {
    if (isActive) refresh();
    setEditMode(false);
    setCategoryFilter("all");
  }, [activeProfile, isActive, refresh]);

  const filteredEntries = useMemo(() => {
    if (categoryFilter === "all") return entries;
    return entries.filter((e) => normalizeCategoryId(e.categoryId) === categoryFilter);
  }, [entries, categoryFilter]);

  const empty = useMemo(() => filteredEntries.length === 0, [filteredEntries.length]);

  const onDelete = (entry: VisitEntry) => {
    Alert.alert(t("log.deleteDialogTitle"), t("log.deleteDialogMsg"), [
      { text: t("log.cancel"), style: "cancel" },
      {
        text: t("log.confirmDelete"),
        style: "destructive",
        onPress: async () => {
          await deleteOne(entry.id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: theme.muted, flex: 1 }}>
          {busy ? t("log.loading") : `${filteredEntries.length} ${t("log.entries")}`}
        </Text>

        <Pressable onPress={() => setFilterOpen(true)} style={{ padding: 10 }}>
          <Text style={{ color: theme.accent, fontWeight: "900" }}>{t("log.filter")}</Text>
        </Pressable>

        <Pressable onPress={() => setEditMode((v) => !v)} style={{ padding: 10 }}>
          <Text style={{ color: theme.accent, fontWeight: "900" }}>
            {editMode ? t("log.done") : t("log.edit")}
          </Text>
        </Pressable>
      </View>

      {empty ? (
        <View style={{ paddingTop: 40 }}>
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 16 }}>
            {t("log.emptyTitle")}
          </Text>
          <Text style={{ color: theme.muted, marginTop: 8 }}>
            {t("log.emptyMsg")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const cat = categoryDef(normalizeCategoryId(item.categoryId));
            return (
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
                <View>
                  <Image
                    source={{ uri: item.photoUri }}
                    style={{ width: "100%", height: 220 }}
                    resizeMode="cover"
                  />

                  {editMode ? (
                    <Pressable
                      onPress={() => onDelete(item)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.25)",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "900" }}>
                        {t("log.delete")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>

                <View style={{ padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
                    <Text style={{ color: theme.muted, fontWeight: "900" }}>
                      {t(cat.labelKey as any)}
                    </Text>
                  </View>

                  <Text style={{ color: theme.text, fontWeight: "900", marginTop: 6 }}>
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
                      {t("log.noGps")}
                    </Text>
                  )}

                  {item.comment ? (
                    <Text style={{ color: theme.text, marginTop: 10 }}>{item.comment}</Text>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Filter modal */}
      <Modal
        transparent
        visible={filterOpen}
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >
        <Pressable
          onPress={() => setFilterOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 16,
            justifyContent: "center",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 16 }}>
              {t("log.filterTitle")}
            </Text>

            <View style={{ height: 12 }} />

            <Text style={{ color: theme.muted, fontWeight: "800" }}>
              {t("log.category")}
            </Text>

            <View style={{ height: 10 }} />

            <Pressable
              onPress={() => setCategoryFilter("all")}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: categoryFilter === "all" ? 2 : 1,
                borderColor: categoryFilter === "all" ? theme.accent : theme.border,
                backgroundColor: categoryFilter === "all" ? theme.surface : "transparent",
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "900" }}>{t("log.showAll")}</Text>
            </Pressable>

            <View style={{ height: 10 }} />

            {CATEGORIES.map((c) => {
              const active = categoryFilter === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryFilter(c.id)}
                  style={{
                    marginTop: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: active ? 2 : 1,
                    borderColor: active ? theme.accent : theme.border,
                    backgroundColor: active ? theme.surface : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                  <Text style={{ color: active ? theme.text : theme.muted, fontWeight: "900" }}>
                    {t(c.labelKey as any)}
                  </Text>
                </Pressable>
              );
            })}

            <View style={{ height: 14 }} />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setCategoryFilter("all")}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {t("log.clearFilter")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilterOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.surface,
                  borderWidth: 2,
                  borderColor: theme.accent,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {t("log.apply")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
