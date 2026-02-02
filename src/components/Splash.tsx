import React from "react";
import { View, Text } from "react-native";
import { theme } from "../ui/theme";

export default function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Placeholder for logo (bytt til Image når logo finnes) */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: "center",
          justifyContent: "center",
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <Text style={{ color: theme.text, fontWeight: "900", fontSize: 22 }}>
          R:V
        </Text>
      </View>

      <Text
        style={{
          marginTop: 18,
          color: theme.text,
          fontWeight: "900",
          fontSize: 20,
        }}
      >
        Re:visit?
      </Text>

      <Text style={{ marginTop: 8, color: theme.muted }}>
        One moment. One truth.
      </Text>

      <Text
        style={{
          position: "absolute",
          bottom: 18,
          color: theme.muted,
          fontSize: 12,
        }}
      >
        powered by MCL
      </Text>
    </View>
  );
}
