// ============================
// BLOCK: IMPORTS (START)
// ============================
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Modal, Pressable, Text, View } from "react-native";
import { theme } from "../ui/theme";
import type { ProfileId, VisitEntry } from "../types/entry";
import { deleteEntry, listEntries } from "../storage/entries";
import { t } from "../i18n/i18n";
import { CATEGORIES, type CategoryId } from "../constants/categories";
// ============================
// BLOCK: IMPORTS (END)
// ============================

export default function LogScreen({
  isActive,
  activeProfile,
}: {
  isActive: boolean;
  activeProfile: ProfileId;
}) {
  const [items, setItems] = useState<VisitEntry[]>([]);
  const [busy, setBusy] = useState(false);

  // filter
  const [filterCategory, setFilterCategory] = useState<CategoryId | "all">("all");

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<VisitEntry | null>(null);

  // delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VisitEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const list = await listEntries(activeProfile);
      setItems(list);
    } finally {
      setBusy(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (isActive) refresh();
  }, [isActive, refresh]);

  useEffect(() => {
    if (isActive) {
      refresh();
    }
  }, [isActive, refresh, filterCategory]);

  const filtered = useMemo(() => {
    if (filterCategory === "all") return items;
    return items.filter((i) => i.categoryId === filterCategory);
  }, [items, filterCategory]);

  const openPreview = (item: VisitEntry) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };

  const askDelete = (item: VisitEntry) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteEntry(deleteTarget.id);
      await refresh();
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
          {t("log.title")}
        </Text>

        {/* Filter */}
        <FlatList
          data={[{ id: "all" as const, emoji: "📋" }, ...CATEGORIES]}
          keyExtractor={(i) => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
          renderItem={({ item }) => {
            const id = item.id;
            const active = filterCategory === id;

            const label =
              id === "all"
                ? t("log.filterAll")
                : t(`categories.${id}` as const);

            return (
              <Pressable
                onPress={() => setFilterCategory(id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: active ? 2 : 1,
                  borderColor: active ? theme.accent : theme.border,
                  backgroundColor: active ? theme.surface : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text style={{ fontWeight: "900" }}>
                  {"emoji" in item ? item.emoji : "📋"}
                </Text>
                <Text
                  style={{
                    color: active ? theme.text : theme.muted,
                    fontWeight: "900",
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={{ paddingTop: 24, paddingHorizontal: 16 }}>
            <Text style={{ color: theme.muted }}>
              {busy ? t("log.loading") : t("log.empty")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openPreview(item)}
            style={{
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <Image source={{ uri: item.photoUri }} style={{ height: 180, width: "100%" }} />

            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {t(`categories.${item.categoryId}` as const)}
                </Text>
                <Text style={{ color: theme.muted }}>
                  {item.rating === "yes" ? "🙂" : item.rating === "no" ? "🙁" : "😐"}
                </Text>
              </View>

              {item.comment ? (
                <Text style={{ color: theme.text, marginTop: 8 }}>{item.comment}</Text>
              ) : null}

              <Pressable
                onPress={() => askDelete(item)}
                style={{ marginTop: 10, alignSelf: "flex-start" }}
              >
                <Text style={{ color: theme.danger, fontWeight: "900" }}>
                  {t("log.delete")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      {/* Preview */}
      <Modal visible={previewOpen} animationType="slide" onRequestClose={() => setPreviewOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={{ padding: 16 }}>
            <Pressable onPress={() => setPreviewOpen(false)}>
              <Text style={{ color: theme.accent, fontWeight: "900" }}>
                {t("log.close")}
              </Text>
            </Pressable>
          </View>

          {previewItem ? (
            <ScrollPreview item={previewItem} />
          ) : null}
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal visible={deleteOpen} transparent animationType="fade" onRequestClose={() => setDeleteOpen(false)}>
        <Pressable
          onPress={() => setDeleteOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 18,
            justifyContent: "center",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: theme.card,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 16,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
              {t("log.deleteTitle")}
            </Text>
            <Text style={{ color: theme.muted, marginTop: 10 }}>
              {t("log.deleteMsg")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Pressable
                onPress={() => setDeleteOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: theme.danger,
                }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>
                  {t("log.cancel")}
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: theme.ok,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "900" }}>
                  {t("log.confirm")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ScrollPreview({ item }: { item: VisitEntry }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Image
        source={{ uri: item.photoUri }}
        style={{
          width: "100%",
          height: 420,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      />

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
          {t(`categories.${item.categoryId}` as const)}
        </Text>

        {item.comment ? (
          <Text style={{ color: theme.text, marginTop: 8 }}>{item.comment}</Text>
        ) : (
          <Text style={{ color: theme.muted, marginTop: 8 }}>{t("log.noComment")}</Text>
        )}
      </View>
    </View>
  );
}
