import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { theme } from "../ui/theme";

export default function PaywallModal({
  visible,
  title,
  message,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
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
            {title}
          </Text>

          <Text style={{ color: theme.muted, marginTop: 10 }}>{message}</Text>

          <View style={{ height: 14 }} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            {secondaryLabel && onSecondary ? (
              <Pressable
                onPress={onSecondary}
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
                  {secondaryLabel}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={onPrimary}
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
              <Text style={{ color: theme.text, fontWeight: "900" }}>{primaryLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

